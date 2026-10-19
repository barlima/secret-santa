-- The admin account. Sets a password on first visit like everyone else.
insert into public.participants (full_name, is_admin)
values ('Bartłomiej Perucki', true)
on conflict do nothing;
