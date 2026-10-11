-- Abhinomous database setup.
-- Run once in Supabase → SQL Editor → New query → paste this file → Run.
-- Safe to re-run: it only creates what is missing and replaces policies.

-- ─── Admins ────────────────────────────────────────────────────────────────
-- Only users listed here can write. Sign-ups should also be switched off
-- (Authentication → Sign In / Providers → "Allow new users to sign up").
create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade
);
alter table public.admins enable row level security;

-- A signed-in user can see only their own row; that's how the admin page checks access.
-- Nobody can add, change or remove admins through the API.
grant select on public.admins to authenticated;
drop policy if exists "Admins can see themselves" on public.admins;
create policy "Admins can see themselves" on public.admins for select to authenticated using (user_id = (select auth.uid()));

-- Used by the access rules below. It lives in a schema the API doesn't expose,
-- so it can't be called directly from outside.
create schema if not exists private;
grant usage on schema private to authenticated;

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins where user_id = (select auth.uid()));
$$;

revoke all on function private.is_admin() from public, anon;
grant execute on function private.is_admin() to authenticated;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ─── Content ───────────────────────────────────────────────────────────────
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null,
  excerpt text,
  cover_url text,
  content text not null default '',
  published boolean not null default false,
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.book_reviews (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null,
  author text,
  cover_url text,
  rating smallint check (rating between 1 and 5),
  content text not null default '',
  finished_on date,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.life_moments (
  id uuid primary key default gen_random_uuid(),
  photo_url text not null,
  caption text,
  happened_on date,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  kind text not null default 'skill' check (kind in ('skill', 'course', 'certificate')),
  status text not null default 'learning' check (status in ('learning', 'done')),
  link text,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists public.learning_log (
  id uuid primary key default gen_random_uuid(),
  logged_on date not null unique default current_date,
  minutes integer not null default 30 check (minutes > 0 and minutes <= 1440),
  note text
);

create table if not exists public.site_settings (
  id smallint primary key default 1 check (id = 1),
  intro text,
  quote text,
  quote_author text,
  email text,
  instagram text,
  x text,
  linkedin text,
  goodreads text,
  avatar_url text,
  updated_at timestamptz not null default now()
);

-- Added after the first release; makes re-running this file upgrade older databases.
alter table public.site_settings add column if not exists avatar_url text;

insert into public.site_settings (id, intro)
values (1, 'I write about the books I read, the things I’m learning, and the life in between.')
on conflict (id) do nothing;

create index if not exists posts_published_idx on public.posts (published, published_at desc);
create index if not exists book_reviews_published_idx on public.book_reviews (published, finished_on desc);
create index if not exists life_moments_published_idx on public.life_moments (published, happened_on desc);

drop trigger if exists posts_touch on public.posts;
create trigger posts_touch before update on public.posts for each row execute function public.touch_updated_at();
drop trigger if exists book_reviews_touch on public.book_reviews;
create trigger book_reviews_touch before update on public.book_reviews for each row execute function public.touch_updated_at();
drop trigger if exists site_settings_touch on public.site_settings;
create trigger site_settings_touch before update on public.site_settings for each row execute function public.touch_updated_at();

-- ─── Access rules ──────────────────────────────────────────────────────────
-- Everyone can read published content. Only admins can read drafts (through their
-- "manage" rule) or write.
grant select on public.posts, public.book_reviews, public.life_moments, public.skills, public.learning_log, public.site_settings to anon, authenticated;
grant insert, update, delete on public.posts, public.book_reviews, public.life_moments, public.skills, public.learning_log, public.site_settings to authenticated;

alter table public.posts enable row level security;
alter table public.book_reviews enable row level security;
alter table public.life_moments enable row level security;
alter table public.skills enable row level security;
alter table public.learning_log enable row level security;
alter table public.site_settings enable row level security;

drop policy if exists "Read published posts" on public.posts;
create policy "Read published posts" on public.posts for select to anon, authenticated using (published);
drop policy if exists "Admins manage posts" on public.posts;
create policy "Admins manage posts" on public.posts for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));

drop policy if exists "Read published reviews" on public.book_reviews;
create policy "Read published reviews" on public.book_reviews for select to anon, authenticated using (published);
drop policy if exists "Admins manage reviews" on public.book_reviews;
create policy "Admins manage reviews" on public.book_reviews for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));

drop policy if exists "Read published moments" on public.life_moments;
create policy "Read published moments" on public.life_moments for select to anon, authenticated using (published);
drop policy if exists "Admins manage moments" on public.life_moments;
create policy "Admins manage moments" on public.life_moments for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));

drop policy if exists "Read skills" on public.skills;
create policy "Read skills" on public.skills for select to anon, authenticated using (true);
drop policy if exists "Admins manage skills" on public.skills;
create policy "Admins manage skills" on public.skills for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));

drop policy if exists "Read learning log" on public.learning_log;
create policy "Read learning log" on public.learning_log for select to anon, authenticated using (true);
drop policy if exists "Admins manage learning log" on public.learning_log;
create policy "Admins manage learning log" on public.learning_log for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));

drop policy if exists "Read settings" on public.site_settings;
create policy "Read settings" on public.site_settings for select to anon, authenticated using (true);
drop policy if exists "Admins manage settings" on public.site_settings;
create policy "Admins manage settings" on public.site_settings for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));

-- ─── Image storage ─────────────────────────────────────────────────────────
-- A public bucket: anyone can view images by URL, only admins can upload or delete.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif', 'image/heic'])
on conflict (id) do update set public = true;

drop policy if exists "Admins read media" on storage.objects;
create policy "Admins read media" on storage.objects for select to authenticated using (bucket_id = 'media' and (select private.is_admin()));
drop policy if exists "Admins upload media" on storage.objects;
create policy "Admins upload media" on storage.objects for insert to authenticated with check (bucket_id = 'media' and (select private.is_admin()));
drop policy if exists "Admins update media" on storage.objects;
create policy "Admins update media" on storage.objects for update to authenticated using (bucket_id = 'media' and (select private.is_admin()));
drop policy if exists "Admins delete media" on storage.objects;
create policy "Admins delete media" on storage.objects for delete to authenticated using (bucket_id = 'media' and (select private.is_admin()));

-- ─── Upgrades ──────────────────────────────────────────────────────────────
-- Earlier versions kept is_admin() in the public schema, where the API exposed it.
drop function if exists public.is_admin();

-- ─── Make yourself the admin ───────────────────────────────────────────────
-- 1. Authentication → Users → "Add user" → create the login (email + password, tick "Auto Confirm").
-- 2. Then run this line with that email:
-- insert into public.admins (user_id) select id from auth.users where email = 'you@example.com';
