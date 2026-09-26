-- Run this once against the Vercel Postgres database, before deploying
-- or using /admin. Vercel dashboard -> Storage -> your database -> Query
-- tab is the easiest way; paste this in and run it.
--
-- Safe to commit: table definitions only, no data.

create table if not exists members (
  email text primary key
);

create table if not exists resources (
  id bigserial primary key,
  label text not null,
  url text not null
);

-- --- Members-only resource categories and events ---
-- Run this block once too (safe to re-run). Order of groups on /members comes
-- from categories.sort_order; the seed uses gaps of 10 so a new category can
-- be slotted in between without renumbering.

create table if not exists categories (
  id bigserial primary key,
  name text not null unique,
  description text,
  sort_order int not null default 0
);

alter table resources
  add column if not exists category_id bigint references categories(id) on delete restrict,
  add column if not exists description text,
  add column if not exists sort_order int not null default 0;

insert into categories (name, description, sort_order) values
  ('Prepare', 'Guides and workshops to get ready for recruiting and internships', 10),
  ('Find roles', 'Where to find open internships and full-time roles', 20),
  ('Peers', 'Learn from and connect with other members', 30),
  ('Club insights', 'Surveys and reporting from the club', 40)
on conflict (name) do nothing;

-- Local date/time on purpose (no timezone column): every event is in LA.
create table if not exists events (
  id bigserial primary key,
  title text not null,
  category text not null,
  event_date date not null,
  start_time time,
  end_time time,
  location text,
  description text,
  url text,
  created_at timestamptz not null default now()
);

create index if not exists events_event_date_idx on events (event_date);

-- --- Member roles (a member can have several) ---
-- Roles are a fixed list in src/lib/roles.ts ('club-member', 'admin').
-- Admin access = an email in the ADMIN_EMAILS env var (permanent backstop)
-- OR a member with the 'admin' role here. Safe to re-run: the backfill only
-- touches members that have no role yet.

create table if not exists member_roles (
  email text not null references members(email) on delete cascade,
  role text not null,
  primary key (email, role)
);

insert into member_roles (email, role)
select email, 'club-member' from members m
where not exists (select 1 from member_roles r where r.email = m.email)
on conflict do nothing;

-- --- "Start here" pins ---
-- Resources with featured = true appear as the big cards at the top of the
-- members home page. Set on /admin/resources. Safe to re-run.

alter table resources add column if not exists featured boolean not null default false;

-- --- Account requests ---
-- Someone asks for an account on /request-access (name + @g.ucla.edu email);
-- admins approve or reject on /admin/requests. Approving adds the email to
-- members with the club-member role. One row per email; a rejected (or
-- approved-then-removed) person can ask again, which resets it to pending.
-- Holds names and emails of prospective members: database only, never in
-- the repo. Safe to re-run.

create table if not exists access_requests (
  id bigserial primary key,
  email text not null unique,
  name text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  decided_at timestamptz,
  decided_by text
);

create index if not exists access_requests_status_idx on access_requests (status);
