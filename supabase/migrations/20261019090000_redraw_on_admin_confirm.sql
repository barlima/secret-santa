-- Changes to the group after a finished draw no longer redraw automatically.
-- The draw keeps its result and is marked stale; the admin is asked whether to
-- redraw and does it with public.reset_draw(). Before the draw is done
-- (pending or failed) changes still retry the draw as before.

alter table public.draw add column stale boolean not null default false;

create or replace function private.on_group_changed()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform pg_advisory_xact_lock(hashtext('secret_santa_draw'));

  if (select status from public.draw where id = 1) = 'done' then
    update public.draw set stale = true where id = 1;
    return null;
  end if;

  perform private.invalidate_draw();
  perform private.maybe_run_draw();
  return null;
end;
$$;

-- Admin: clear every result and draw again (runs at once if everyone has joined).
create or replace function public.reset_draw()
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
  update public.draw set stale = false where id = 1;
  perform private.maybe_run_draw();
end;
$$;
