-- Performance advisor: cover the participant_a foreign key (participant_b already has one).
create index spouse_pairs_a_idx on public.spouse_pairs (participant_a);
