-- Live waiting room: clients listen for sign-ups and draw status changes.
-- Realtime applies RLS per subscriber, so nobody receives rows they can't read.
-- assignments stays out of the publication on purpose.
alter publication supabase_realtime add table public.participants, public.draw;
