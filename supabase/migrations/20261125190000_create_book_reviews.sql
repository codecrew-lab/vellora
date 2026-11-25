create table if not exists public.book_reviews (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references public.books(id) on delete cascade,
  reviewer_key uuid not null,
  display_name text not null default 'Reader',
  rating smallint not null check (rating between 1 and 5),
  review_text text not null check (char_length(trim(review_text)) between 10 and 2000),
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  unique (book_id, reviewer_key)
);
create index if not exists book_reviews_public_idx on public.book_reviews (book_id, submitted_at desc) where status = 'approved';
create index if not exists book_reviews_pending_idx on public.book_reviews (submitted_at asc) where status = 'pending';
alter table public.book_reviews enable row level security;
revoke all on table public.book_reviews from anon, authenticated;
grant select, insert on table public.book_reviews to anon, authenticated;
-- The Admin Edge Function uses the service_role key to review pending submissions.
grant select, update on table public.book_reviews to service_role;
drop policy if exists "Anyone can read approved book reviews" on public.book_reviews;
create policy "Anyone can read approved book reviews" on public.book_reviews for select to anon, authenticated using (status = 'approved');
drop policy if exists "Readers can submit pending book reviews" on public.book_reviews;
create policy "Readers can submit pending book reviews" on public.book_reviews for insert to anon, authenticated with check (
 status = 'pending' and rating between 1 and 5
 and char_length(trim(review_text)) between 10 and 2000
 and char_length(trim(display_name)) between 1 and 60
);
