create table if not exists public.book_submissions (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(btrim(title)) between 1 and 180),
  author text not null check (char_length(btrim(author)) between 1 and 160),
  genre text not null check (genre in ('Fantasy','Romance','Mystery','Thriller','Horror','Science Fiction','Adventure','Drama','Historical Fiction','Poetry','Children’s Fiction','Young Adult','Non-fiction')),
  language text not null default 'English' check (char_length(btrim(language)) between 1 and 80),
  description text not null default '' check (char_length(description) <= 3000),
  manuscript_content text not null check (char_length(btrim(manuscript_content)) between 20 and 1500000),
  cover_style text not null check (cover_style in ('nocturne','botanical','gilded','midnight','terracotta')),
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  review_note text,
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz
);
create index if not exists book_submissions_status_submitted_at_idx
  on public.book_submissions (status, submitted_at desc);
alter table public.book_submissions enable row level security;
revoke all on table public.book_submissions from anon, authenticated;
grant insert (title, author, genre, language, description, manuscript_content, cover_style)
  on table public.book_submissions to anon;
grant all on table public.book_submissions to service_role;
drop policy if exists "Public can submit pending books" on public.book_submissions;
create policy "Public can submit pending books"
  on public.book_submissions for insert to anon
  with check (status = 'pending');
