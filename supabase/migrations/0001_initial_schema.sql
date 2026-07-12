-- Mafilu AI Studio — ilk şema
-- Supabase SQL Editor'de veya `supabase db push` ile çalıştırın.

-- ========== PROFILES ==========
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles: kendi profilini gör"
  on public.profiles for select using (auth.uid() = id);
create policy "profiles: kendi profilini güncelle"
  on public.profiles for update using (auth.uid() = id);

-- Yeni kullanıcı kaydında profil satırı oluştur
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ========== PROJECTS ==========
create type public.project_status as enum ('draft', 'editing', 'published');

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 120),
  description text,
  status public.project_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index projects_user_id_idx on public.projects (user_id);

alter table public.projects enable row level security;

create policy "projects: kendi projeleri (tümü)"
  on public.projects for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ========== GENERATIONS ==========
create type public.generation_type as enum ('video', 'image');
create type public.generation_status as enum ('pending', 'processing', 'succeeded', 'failed');

create table public.generations (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  prompt text not null check (char_length(prompt) between 1 and 2000),
  type public.generation_type not null default 'video',
  model text not null default '',
  replicate_prediction_id text,
  status public.generation_status not null default 'pending',
  output_url text,
  error_message text,
  created_at timestamptz not null default now()
);

create index generations_project_id_idx on public.generations (project_id);
create index generations_user_id_idx on public.generations (user_id);
create index generations_prediction_idx on public.generations (replicate_prediction_id);

alter table public.generations enable row level security;

create policy "generations: kendi üretimleri (tümü)"
  on public.generations for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ========== TIMELINE ITEMS ==========
create table public.timeline_items (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  generation_id uuid references public.generations (id) on delete set null,
  order_index int not null default 0,
  start_sec numeric not null default 0,
  duration_sec numeric not null default 0,
  caption_text text,
  caption_style jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index timeline_items_project_id_idx on public.timeline_items (project_id);

alter table public.timeline_items enable row level security;

-- Timeline erişimi proje sahipliği üzerinden
create policy "timeline: proje sahibi (tümü)"
  on public.timeline_items for all
  using (exists (
    select 1 from public.projects p
    where p.id = project_id and p.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.projects p
    where p.id = project_id and p.user_id = auth.uid()
  ));

-- ========== PUBLICATIONS ==========
create type public.publish_platform as enum ('instagram', 'tiktok');
create type public.publish_status as enum ('pending', 'published', 'failed');

create table public.publications (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  platform public.publish_platform not null,
  status public.publish_status not null default 'pending',
  external_post_id text,
  published_at timestamptz,
  created_at timestamptz not null default now()
);

create index publications_project_id_idx on public.publications (project_id);

alter table public.publications enable row level security;

create policy "publications: kendi paylaşımları (tümü)"
  on public.publications for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ========== STORAGE ==========
insert into storage.buckets (id, name, public)
values ('generations', 'generations', true)
on conflict (id) do nothing;

create policy "storage: herkes okuyabilir (public bucket)"
  on storage.objects for select using (bucket_id = 'generations');

create policy "storage: kendi klasörüne yazma"
  on storage.objects for insert
  with check (
    bucket_id = 'generations'
    and (auth.uid()::text = (storage.foldername(name))[1] or auth.role() = 'service_role')
  );
