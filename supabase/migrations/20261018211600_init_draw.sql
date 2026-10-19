-- Secret Santa: draw functions, triggers and privileges.
-- Requires 20261018211500_init_tables.sql.

-- ---------------------------------------------------------------------------
-- Helpers (private schema is not exposed through the API)
-- ---------------------------------------------------------------------------

create function private.current_participant_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select id from public.participants where auth_user_id = (select auth.uid());
$$;

create function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.participants
    where auth_user_id = (select auth.uid()) and is_admin
  );
$$;

-- One spouse per person.
create function private.check_one_spouse()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if exists (
    select 1 from public.spouse_pairs
    where id <> new.id
      and (participant_a in (new.participant_a, new.participant_b)
        or participant_b in (new.participant_a, new.participant_b))
  ) then
    raise exception 'already_paired' using errcode = '23505';
  end if;
  return new;
end;
$$;

create trigger spouse_pairs_one_spouse
  before insert or update on public.spouse_pairs
  for each row execute function private.check_one_spouse();

-- ---------------------------------------------------------------------------
-- The draw
-- ---------------------------------------------------------------------------

-- Random permutations, validated until one meets every rule. For groups of
-- up to ~30 a valid permutation turns up within a few dozen attempts; 20 000
-- failures in a row means no valid assignment exists.
create function private.run_draw()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  ids uuid[];
  spouse uuid[];
  perm uuid[];
  n int;
  ok boolean := false;
begin
  select coalesce(array_agg(id), '{}') into ids from public.participants;
  n := coalesce(array_length(ids, 1), 0);

  delete from public.assignments where true;

  if n < 2 then
    update public.draw set status = 'failed', run_at = now(), error = 'too_few_people' where id = 1;
    return;
  end if;

  select array_agg(
    (select case when sp.participant_a = p.pid then sp.participant_b else sp.participant_a end
       from public.spouse_pairs sp
      where p.pid in (sp.participant_a, sp.participant_b))
    order by p.ord)
  into spouse
  from unnest(ids) with ordinality as p(pid, ord);

  for attempt in 1..20000 loop
    perm := array(select x from unnest(ids) as x order by random());
    ok := true;
    for i in 1..n loop
      if perm[i] = ids[i] or perm[i] is not distinct from spouse[i] then
        ok := false;
        exit;
      end if;
    end loop;
    exit when ok;
  end loop;

  if not ok then
    update public.draw set status = 'failed', run_at = now(), error = 'no_valid_assignment' where id = 1;
    return;
  end if;

  insert into public.assignments (giver_id, receiver_id)
  select ids[i], perm[i] from generate_series(1, n) as i;

  update public.draw set status = 'done', run_at = now(), error = null where id = 1;
end;
$$;

-- Runs the draw if it is pending and everyone has a password. The advisory
-- lock serialises concurrent sign-ups: the second transaction waits for the
-- first to commit, then sees both passwords and runs the draw exactly once.
create function private.maybe_run_draw()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform pg_advisory_xact_lock(hashtext('secret_santa_draw'));

  if (select status from public.draw where id = 1) <> 'pending' then
    return;
  end if;

  if not exists (select 1 from public.participants)
     or exists (select 1 from public.participants where auth_user_id is null) then
    return;
  end if;

  perform private.run_draw();
end;
$$;

create function private.invalidate_draw()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform pg_advisory_xact_lock(hashtext('secret_santa_draw'));
  delete from public.assignments where true;
  update public.draw set status = 'pending', run_at = null, error = null where id = 1;
end;
$$;

create function private.on_password_set()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.auth_user_id is not null and old.auth_user_id is distinct from new.auth_user_id then
    perform private.maybe_run_draw();
  end if;
  return null;
end;
$$;

create trigger participants_password_set
  after update of auth_user_id on public.participants
  for each row execute function private.on_password_set();

-- Adding or removing people, or changing spouse pairs, invalidates the draw.
create function private.on_group_changed()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.invalidate_draw();
  perform private.maybe_run_draw();
  return null;
end;
$$;

create trigger participants_group_changed
  after insert or delete on public.participants
  for each statement execute function private.on_group_changed();

create trigger spouse_pairs_group_changed
  after insert or update or delete on public.spouse_pairs
  for each statement execute function private.on_group_changed();

-- Admin: clear every result and draw again (runs at once if everyone has joined).
create function public.reset_draw()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not private.is_admin() then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  perform private.invalidate_draw();
  perform private.maybe_run_draw();
end;
$$;

-- ---------------------------------------------------------------------------
-- Privileges and row-level security
-- ---------------------------------------------------------------------------

revoke all on public.participants, public.spouse_pairs, public.draw, public.assignments from anon, authenticated;
revoke all on all functions in schema private from public, anon, authenticated;
revoke all on function public.reset_draw() from public, anon;

grant usage on schema private to anon, authenticated;
grant execute on function private.current_participant_id(), private.is_admin() to anon, authenticated;
grant execute on function public.reset_draw() to authenticated;

-- participants: names are public (the picker needs them); auth ids only for signed-in users.
grant select (id, full_name, is_admin, has_password, created_at) on public.participants to anon;
grant select (id, full_name, is_admin, has_password, created_at, auth_user_id) on public.participants to authenticated;
grant insert (full_name), update (full_name), delete on public.participants to authenticated;

create policy "Anyone can list participants" on public.participants
  for select to anon, authenticated using (true);
create policy "Admin adds participants" on public.participants
  for insert to authenticated with check ((select private.is_admin()) and not is_admin);
create policy "Admin renames participants" on public.participants
  for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "Admin removes participants" on public.participants
  for delete to authenticated using ((select private.is_admin()) and not is_admin);

-- spouse_pairs
grant select on public.spouse_pairs to authenticated;
grant insert (participant_a, participant_b), delete on public.spouse_pairs to authenticated;

create policy "Signed-in users see spouse pairs" on public.spouse_pairs
  for select to authenticated using (true);
create policy "Admin pairs spouses" on public.spouse_pairs
  for insert to authenticated with check ((select private.is_admin()));
create policy "Admin unpairs spouses" on public.spouse_pairs
  for delete to authenticated using ((select private.is_admin()));

-- draw: status is visible to signed-in users; only the database writes it.
grant select on public.draw to authenticated;
create policy "Signed-in users see draw status" on public.draw
  for select to authenticated using (true);

-- assignments: each giver reads only their own row. Nobody else, admin included.
grant select on public.assignments to authenticated;
create policy "Givers read their own assignment" on public.assignments
  for select to authenticated using (giver_id = (select private.current_participant_id()));
