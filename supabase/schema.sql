-- ============================================================
-- VEEW Connect 2026 — Supabase Database Schema
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ────────────────────────────────────────────────────────────
-- 1. PROFILES (extends Supabase Auth users)
-- ────────────────────────────────────────────────────────────
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  role        text not null check (role in ('buyer','exhibitor','admin')),
  name        text not null,
  company     text,
  position    text,
  phone       text,
  industry    text,
  needs       text,
  country     text default 'Vietnam',
  buyer_type  text check (buyer_type in ('International','Domestic')),
  status      text not null default 'pending'
              check (status in ('pending','approved','rejected')),
  internal_notes text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- Auto-update updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

-- Auto-create profile when user signs up (for admin-created accounts)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  -- Only create profile if metadata was provided (admin-created accounts)
  if new.raw_user_meta_data->>'role' is not null then
    insert into public.profiles (id, role, name, company, position, phone, industry, status)
    values (
      new.id,
      coalesce(new.raw_user_meta_data->>'role', 'buyer'),
      coalesce(new.raw_user_meta_data->>'name', ''),
      new.raw_user_meta_data->>'company',
      new.raw_user_meta_data->>'position',
      new.raw_user_meta_data->>'phone',
      new.raw_user_meta_data->>'industry',
      coalesce(new.raw_user_meta_data->>'status', 'pending')
    );
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ────────────────────────────────────────────────────────────
-- 2. EXHIBITORS (company profiles, separate from auth)
-- ────────────────────────────────────────────────────────────
create table public.exhibitors (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid references auth.users(id) on delete set null,
  name         text not null,
  category     text not null,
  booth        text,
  emoji        text default '🏢',
  description  text,
  contact_name text not null,
  email        text not null unique,
  website      text,
  created_by   uuid references auth.users(id),
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

create trigger exhibitors_updated_at
  before update on public.exhibitors
  for each row execute procedure public.handle_updated_at();

-- ────────────────────────────────────────────────────────────
-- 3. SLOTS (exhibitor availability)
-- ────────────────────────────────────────────────────────────
create table public.slots (
  id              uuid primary key default uuid_generate_v4(),
  exhibitor_id    uuid not null references public.exhibitors(id) on delete cascade,
  event_date      date not null,           -- e.g. 2026-10-17
  start_time      time not null,           -- e.g. 09:00
  duration_mins   integer not null default 30,
  venue           text not null default 'Buyers Lounge, Hall 5-6',
  is_open         boolean not null default true,
  created_at      timestamptz default now(),
  unique(exhibitor_id, event_date, start_time)
);

create index slots_exhibitor_date on public.slots(exhibitor_id, event_date);
create index slots_open on public.slots(is_open, event_date);

-- ────────────────────────────────────────────────────────────
-- 4. MEETINGS (booked appointments)
-- ────────────────────────────────────────────────────────────
create table public.meetings (
  id            uuid primary key default uuid_generate_v4(),
  buyer_id      uuid not null references auth.users(id),
  exhibitor_id  uuid not null references public.exhibitors(id),
  slot_id       uuid references public.slots(id) on delete set null,
  event_date    date not null,
  start_time    time not null,
  venue         text not null default 'Buyers Lounge, Hall 5-6',
  status        text not null default 'pending'
                check (status in ('pending','confirmed','rejected','cancelled')),
  notes         text,
  arranged_by   uuid references auth.users(id),  -- admin who arranged
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

create trigger meetings_updated_at
  before update on public.meetings
  for each row execute procedure public.handle_updated_at();

create index meetings_buyer on public.meetings(buyer_id);
create index meetings_exhibitor on public.meetings(exhibitor_id);
create index meetings_date on public.meetings(event_date, start_time);

-- ────────────────────────────────────────────────────────────
-- 5. PROPOSALS (exhibitor → admin → buyer)
-- ────────────────────────────────────────────────────────────
create table public.proposals (
  id            uuid primary key default uuid_generate_v4(),
  exhibitor_id  uuid not null references public.exhibitors(id),
  buyer_id      uuid references auth.users(id),  -- null if buyer not yet in system
  buyer_email   text,                             -- fallback when buyer_id is null
  message       text not null,
  status        text not null default 'pending'
                check (status in ('pending','arranged','rejected')),
  meeting_id    uuid references public.meetings(id) on delete set null,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

create trigger proposals_updated_at
  before update on public.proposals
  for each row execute procedure public.handle_updated_at();

-- ────────────────────────────────────────────────────────────
-- 6. IMPORT LOGS (track bulk buyer imports)
-- ────────────────────────────────────────────────────────────
create table public.import_logs (
  id            uuid primary key default uuid_generate_v4(),
  admin_id      uuid references auth.users(id),
  source        text not null check (source in ('csv','excel','google_sheet')),
  filename      text,
  sheet_url     text,
  total_rows    integer not null default 0,
  imported      integer not null default 0,
  skipped       integer not null default 0,
  created_at    timestamptz default now()
);

-- ────────────────────────────────────────────────────────────
-- 7. EMAIL LOGS (track sent emails)
-- ────────────────────────────────────────────────────────────
create table public.email_logs (
  id          uuid primary key default uuid_generate_v4(),
  to_email    text not null,
  subject     text not null,
  type        text not null,  -- 'credentials','booking_confirm','approval', etc.
  sent_by     uuid references auth.users(id),
  sent_at     timestamptz default now(),
  resend_id   text  -- Resend message ID for tracking
);

-- ════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ════════════════════════════════════════════════════════════

alter table public.profiles    enable row level security;
alter table public.exhibitors  enable row level security;
alter table public.slots       enable row level security;
alter table public.meetings    enable row level security;
alter table public.proposals   enable row level security;
alter table public.import_logs enable row level security;
alter table public.email_logs  enable row level security;

-- Helper: get current user's role
create or replace function public.current_role()
returns text as $$
  select role from public.profiles where id = auth.uid()
$$ language sql security definer stable;

-- ── profiles ─────────────────────────────────────────────────
-- Users see their own profile; admins see all
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id or public.current_role() = 'admin');

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id or public.current_role() = 'admin');

create policy "profiles_insert_self" on public.profiles
  for insert with check (auth.uid() = id);

create policy "profiles_admin_all" on public.profiles
  for all using (public.current_role() = 'admin');

-- ── exhibitors ────────────────────────────────────────────────
-- Anyone authenticated can read exhibitors; only admin can write
create policy "exhibitors_select_auth" on public.exhibitors
  for select using (auth.role() = 'authenticated');

create policy "exhibitors_write_admin" on public.exhibitors
  for all using (public.current_role() = 'admin');

-- Exhibitors can update their own record
create policy "exhibitors_update_own" on public.exhibitors
  for update using (user_id = auth.uid());

-- ── slots ─────────────────────────────────────────────────────
-- Authenticated users can view open slots
create policy "slots_select_auth" on public.slots
  for select using (auth.role() = 'authenticated');

-- Exhibitors manage their own slots; admin manages all
create policy "slots_write_exhibitor" on public.slots
  for all using (
    exhibitor_id in (select id from public.exhibitors where user_id = auth.uid())
    or public.current_role() = 'admin'
  );

-- ── meetings ──────────────────────────────────────────────────
-- Buyers see their own; exhibitors see meetings for their exhibitor; admin sees all
create policy "meetings_select" on public.meetings
  for select using (
    buyer_id = auth.uid()
    or exhibitor_id in (select id from public.exhibitors where user_id = auth.uid())
    or public.current_role() = 'admin'
  );

create policy "meetings_insert_buyer" on public.meetings
  for insert with check (
    buyer_id = auth.uid()
    or public.current_role() = 'admin'
  );

create policy "meetings_update_admin_or_exhibitor" on public.meetings
  for update using (
    exhibitor_id in (select id from public.exhibitors where user_id = auth.uid())
    or public.current_role() = 'admin'
  );

-- ── proposals ─────────────────────────────────────────────────
create policy "proposals_select" on public.proposals
  for select using (
    buyer_id = auth.uid()
    or exhibitor_id in (select id from public.exhibitors where user_id = auth.uid())
    or public.current_role() = 'admin'
  );

create policy "proposals_insert_exhibitor" on public.proposals
  for insert with check (
    exhibitor_id in (select id from public.exhibitors where user_id = auth.uid())
    or public.current_role() = 'admin'
  );

create policy "proposals_update_admin" on public.proposals
  for update using (public.current_role() = 'admin');

-- ── import_logs & email_logs ──────────────────────────────────
create policy "import_logs_admin" on public.import_logs
  for all using (public.current_role() = 'admin');

create policy "email_logs_admin" on public.email_logs
  for all using (public.current_role() = 'admin');

-- ════════════════════════════════════════════════════════════
-- SEED DATA — Event dates
-- ════════════════════════════════════════════════════════════
-- Run separately after schema is created and admin user exists

-- Example: create admin user via Supabase Dashboard → Auth → Add user
-- Then run:
-- insert into public.profiles (id, role, name, company, status)
-- values ('<admin-user-uuid>', 'admin', 'VEEW Admin', 'Ban Tổ Chức VEEW', 'approved');
