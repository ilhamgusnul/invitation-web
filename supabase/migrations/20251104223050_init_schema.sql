-- =============================================================================
-- INIT SCHEMA: Web Undangan Platform
-- Author: Code Agent
-- Purpose: Initialize all tables, enums, indexes, and RLS policies
-- =============================================================================

-- Note: gen_random_uuid() is available by default in Supabase

-- =============================================================================
-- ENUMS
-- =============================================================================

create type public.org_member_role as enum ('owner', 'admin');
create type public.event_status as enum ('draft', 'published');
create type public.guest_status as enum ('invited', 'sent', 'opened', 'rsvped');
create type public.rsvp_status as enum ('yes', 'no', 'maybe');
create type public.media_type as enum ('image', 'video');
create type public.donation_method as enum ('qris', 'transfer');
create type public.donation_status as enum ('pending', 'confirmed', 'rejected');

-- =============================================================================
-- TABLES
-- =============================================================================

-- Users (extends Supabase auth.users)
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null unique,
  avatar_url text,
  created_at timestamptz not null default now()
);

-- Organizations
create table public.orgs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid not null references public.users(id) on delete cascade,
  plan text not null default 'free',
  created_at timestamptz not null default now()
);

-- Organization Members
create table public.org_members (
  org_id uuid not null references public.orgs(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  role public.org_member_role not null default 'admin',
  created_at timestamptz not null default now(),
  primary key (org_id, user_id)
);

-- Themes
create table public.themes (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  preview_url text,
  tokens jsonb not null default '{}',
  is_premium boolean not null default false,
  created_at timestamptz not null default now()
);

-- Events
create table public.events (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references public.orgs(id) on delete set null,
  user_id uuid not null references public.users(id) on delete cascade,
  slug text not null unique,
  title text not null,
  theme_id uuid references public.themes(id) on delete set null,
  status public.event_status not null default 'draft',
  publish_at timestamptz,
  expire_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Event Details
create table public.event_details (
  event_id uuid primary key references public.events(id) on delete cascade,
  couple jsonb not null default '{}',
  story text,
  music_url text,
  seo_meta jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Venues
create table public.venues (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  name text not null,
  address text not null,
  lat numeric(10, 8),
  lng numeric(11, 8),
  note text,
  created_at timestamptz not null default now()
);

-- Schedules
create table public.schedules (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  title text not null,
  datetime timestamptz not null,
  tz text not null default 'Asia/Jakarta',
  venue_id uuid references public.venues(id) on delete set null,
  created_at timestamptz not null default now()
);

-- Guests
create table public.guests (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  name text not null,
  phone text,
  email text,
  segment text,
  pin text,
  invite_token text unique,
  status public.guest_status not null default 'invited',
  created_at timestamptz not null default now()
);

-- RSVPs
create table public.rsvps (
  id uuid primary key default gen_random_uuid(),
  guest_id uuid not null references public.guests(id) on delete cascade,
  status public.rsvp_status not null,
  pax integer not null default 1,
  note text,
  created_at timestamptz not null default now()
);

-- Messages (Guestbook)
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  name text not null,
  message text not null,
  approved boolean not null default false,
  created_at timestamptz not null default now()
);

-- Media (Gallery)
create table public.media (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  type public.media_type not null,
  url text not null,
  sort integer not null default 0,
  created_at timestamptz not null default now()
);

-- Donations
create table public.donations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  method public.donation_method not null,
  amount numeric(15, 2),
  name text not null,
  note text,
  proof_url text,
  status public.donation_status not null default 'pending',
  created_at timestamptz not null default now()
);

-- Analytics Events
create table public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  type text not null,
  meta jsonb not null default '{}',
  created_at timestamptz not null default now()
);

-- =============================================================================
-- INDEXES
-- =============================================================================

create index idx_orgs_owner_id on public.orgs(owner_id);
create index idx_org_members_user_id on public.org_members(user_id);
create index idx_events_user_id on public.events(user_id);
create index idx_events_org_id on public.events(org_id);
create index idx_events_slug on public.events(slug);
create index idx_events_status on public.events(status);
create index idx_guests_event_id on public.guests(event_id);
create index idx_guests_invite_token on public.guests(invite_token);
create index idx_messages_event_id on public.messages(event_id);
create index idx_media_event_id on public.media(event_id);
create index idx_analytics_events_event_id on public.analytics_events(event_id);
create index idx_analytics_events_type on public.analytics_events(type);
create index idx_analytics_events_created_at on public.analytics_events(created_at);

-- =============================================================================
-- RLS POLICIES
-- =============================================================================

-- Users: Full access to own profile
alter table public.users enable row level security;

create policy users_own_access on public.users
  for all using ( id = auth.uid() )
  with check ( id = auth.uid() );

-- Orgs: Owner and members can read
alter table public.orgs enable row level security;

create policy orgs_owner_full_access on public.orgs
  for all using ( owner_id = auth.uid() )
  with check ( owner_id = auth.uid() );

create policy orgs_member_read on public.orgs
  for select using (
    exists (
      select 1 from public.org_members m
      where m.org_id = orgs.id and m.user_id = auth.uid()
    )
  );

-- Org Members: Owner and self can manage
alter table public.org_members enable row level security;

create policy org_members_read on public.org_members
  for select using (
    user_id = auth.uid()
    or exists (
      select 1 from public.orgs o
      where o.id = org_members.org_id and o.owner_id = auth.uid()
    )
  );

create policy org_members_owner_manage on public.org_members
  for all using (
    exists (
      select 1 from public.orgs o
      where o.id = org_members.org_id and o.owner_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.orgs o
      where o.id = org_members.org_id and o.owner_id = auth.uid()
    )
  );

-- Themes: Public read for all authenticated users
alter table public.themes enable row level security;

create policy themes_public_read on public.themes
  for select using ( true );

-- Events: Owner or org members can access
alter table public.events enable row level security;

create policy events_owner_access on public.events
  for all using ( user_id = auth.uid() )
  with check ( user_id = auth.uid() );

create policy events_org_member_access on public.events
  for select using (
    org_id is not null
    and exists (
      select 1 from public.org_members m
      where m.org_id = events.org_id and m.user_id = auth.uid()
    )
  );

create policy events_public_read on public.events
  for select using ( status = 'published' );

-- Event Details: Same as events (via FK)
alter table public.event_details enable row level security;

create policy event_details_owner_access on public.event_details
  for all using (
    exists (
      select 1 from public.events e
      where e.id = event_details.event_id and e.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.events e
      where e.id = event_details.event_id and e.user_id = auth.uid()
    )
  );

create policy event_details_org_member_access on public.event_details
  for select using (
    exists (
      select 1 from public.events e
      join public.org_members m on m.org_id = e.org_id
      where e.id = event_details.event_id and m.user_id = auth.uid()
    )
  );

create policy event_details_public_read on public.event_details
  for select using (
    exists (
      select 1 from public.events e
      where e.id = event_details.event_id and e.status = 'published'
    )
  );

-- Venues: Same pattern as event_details
alter table public.venues enable row level security;

create policy venues_owner_access on public.venues
  for all using (
    exists (
      select 1 from public.events e
      where e.id = venues.event_id and e.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.events e
      where e.id = venues.event_id and e.user_id = auth.uid()
    )
  );

create policy venues_public_read on public.venues
  for select using (
    exists (
      select 1 from public.events e
      where e.id = venues.event_id and e.status = 'published'
    )
  );

-- Schedules: Same pattern
alter table public.schedules enable row level security;

create policy schedules_owner_access on public.schedules
  for all using (
    exists (
      select 1 from public.events e
      where e.id = schedules.event_id and e.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.events e
      where e.id = schedules.event_id and e.user_id = auth.uid()
    )
  );

create policy schedules_public_read on public.schedules
  for select using (
    exists (
      select 1 from public.events e
      where e.id = schedules.event_id and e.status = 'published'
    )
  );

-- Guests: Owner access only
alter table public.guests enable row level security;

create policy guests_owner_access on public.guests
  for all using (
    exists (
      select 1 from public.events e
      where e.id = guests.event_id and e.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.events e
      where e.id = guests.event_id and e.user_id = auth.uid()
    )
  );

-- RSVPs: Owner and guest (via token) can access
alter table public.rsvps enable row level security;

create policy rsvps_owner_access on public.rsvps
  for select using (
    exists (
      select 1 from public.guests g
      join public.events e on e.id = g.event_id
      where g.id = rsvps.guest_id and e.user_id = auth.uid()
    )
  );

create policy rsvps_guest_access on public.rsvps
  for all using (
    exists (
      select 1 from public.guests g
      join public.events e on e.id = g.event_id
      where g.id = rsvps.guest_id and e.status = 'published'
    )
  ) with check (
    exists (
      select 1 from public.guests g
      join public.events e on e.id = g.event_id
      where g.id = rsvps.guest_id and e.status = 'published'
    )
  );

-- Messages: Public insert, owner can moderate
alter table public.messages enable row level security;

create policy messages_public_insert on public.messages
  for insert with check (
    exists (
      select 1 from public.events e
      where e.id = messages.event_id and e.status = 'published'
    )
  );

create policy messages_owner_access on public.messages
  for select using (
    exists (
      select 1 from public.events e
      where e.id = messages.event_id and e.user_id = auth.uid()
    )
  );

create policy messages_owner_moderate on public.messages
  for update using (
    exists (
      select 1 from public.events e
      where e.id = messages.event_id and e.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.events e
      where e.id = messages.event_id and e.user_id = auth.uid()
    )
  );

create policy messages_owner_delete on public.messages
  for delete using (
    exists (
      select 1 from public.events e
      where e.id = messages.event_id and e.user_id = auth.uid()
    )
  );

create policy messages_public_read on public.messages
  for select using (
    approved = true
    and exists (
      select 1 from public.events e
      where e.id = messages.event_id and e.status = 'published'
    )
  );

-- Media: Owner access
alter table public.media enable row level security;

create policy media_owner_access on public.media
  for all using (
    exists (
      select 1 from public.events e
      where e.id = media.event_id and e.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.events e
      where e.id = media.event_id and e.user_id = auth.uid()
    )
  );

create policy media_public_read on public.media
  for select using (
    exists (
      select 1 from public.events e
      where e.id = media.event_id and e.status = 'published'
    )
  );

-- Donations: Public insert, owner can manage
alter table public.donations enable row level security;

create policy donations_public_insert on public.donations
  for insert with check (
    exists (
      select 1 from public.events e
      where e.id = donations.event_id and e.status = 'published'
    )
  );

create policy donations_owner_access on public.donations
  for select using (
    exists (
      select 1 from public.events e
      where e.id = donations.event_id and e.user_id = auth.uid()
    )
  );

create policy donations_owner_manage on public.donations
  for update using (
    exists (
      select 1 from public.events e
      where e.id = donations.event_id and e.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.events e
      where e.id = donations.event_id and e.user_id = auth.uid()
    )
  );

-- Analytics Events: Owner access, public insert for tracking
alter table public.analytics_events enable row level security;

create policy analytics_events_public_insert on public.analytics_events
  for insert with check (
    exists (
      select 1 from public.events e
      where e.id = analytics_events.event_id and e.status = 'published'
    )
  );

create policy analytics_events_owner_read on public.analytics_events
  for select using (
    exists (
      select 1 from public.events e
      where e.id = analytics_events.event_id and e.user_id = auth.uid()
    )
  );

-- =============================================================================
-- FUNCTIONS & TRIGGERS
-- =============================================================================

-- Auto-update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger events_updated_at
  before update on public.events
  for each row
  execute function public.handle_updated_at();

create trigger event_details_updated_at
  before update on public.event_details
  for each row
  execute function public.handle_updated_at();

-- =============================================================================
-- SEED DATA (Themes)
-- =============================================================================

-- Insert sample themes (to be expanded)
insert into public.themes (slug, name, preview_url, is_premium, tokens) values
  ('elegant-white', 'Elegant White', '/themes/elegant-white.jpg', false, '{"primary": "#ffffff", "accent": "#d4af37"}'),
  ('rustic-wood', 'Rustic Wood', '/themes/rustic-wood.jpg', false, '{"primary": "#8B4513", "accent": "#F5DEB3"}'),
  ('modern-minimal', 'Modern Minimal', '/themes/modern-minimal.jpg', false, '{"primary": "#000000", "accent": "#FFD700"}'),
  ('garden-romance', 'Garden Romance', '/themes/garden-romance.jpg', true, '{"primary": "#FFB6C1", "accent": "#90EE90"}'),
  ('classic-gold', 'Classic Gold', '/themes/classic-gold.jpg', true, '{"primary": "#FFD700", "accent": "#FFFFFF"}'),
  ('ocean-blue', 'Ocean Blue', '/themes/ocean-blue.jpg', false, '{"primary": "#1E90FF", "accent": "#FFFFFF"}');

-- =============================================================================
-- COMMENTS
-- =============================================================================

comment on table public.users is 'User profiles extending Supabase auth.users';
comment on table public.orgs is 'Organizations for team collaboration';
comment on table public.events is 'Wedding/event invitations';
comment on table public.themes is 'Reusable invitation themes';
comment on table public.guests is 'Guest list for events';
comment on table public.messages is 'Public guestbook messages';
comment on table public.analytics_events is 'Event tracking and analytics';
