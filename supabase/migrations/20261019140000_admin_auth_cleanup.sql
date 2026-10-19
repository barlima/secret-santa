-- Admin panel support: keep auth.users in step with participants.
--
-- 1. Removing a participant also removes their login. Before this, the auth
--    user was left behind and could still sign in (to an empty account).
-- 2. public.reset_participant_password(): admin-only RPC that deletes the
--    participant's login. auth_user_id is cleared by the FK (on delete set
--    null), so the person sets a new password on their next visit. Their
--    draw result is kept: assignments are keyed by participant, not login.
-- 3. One-off cleanup of logins whose participant was already deleted.

create function private.delete_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.auth_user_id is not null then
    delete from auth.users where id = old.auth_user_id;
  end if;
  return null;
end;
$$;

create trigger participants_delete_auth_user
  after delete on public.participants
  for each row execute function private.delete_auth_user();

create function public.reset_participant_password(participant_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  target uuid;
begin
  if not private.is_admin() then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  select auth_user_id into target from public.participants where id = participant_id;
  if target is not null then
    delete from auth.users where id = target;
  end if;
end;
$$;

revoke all on function private.delete_auth_user() from public, anon, authenticated;
revoke all on function public.reset_participant_password(uuid) from public, anon;
grant execute on function public.reset_participant_password(uuid) to authenticated;

delete from auth.users u
where u.email like '%@santa.local'
  and not exists (select 1 from public.participants p where p.auth_user_id = u.id);
