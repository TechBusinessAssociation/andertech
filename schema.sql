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

-- --- Member profile (self-edited on /members/profile) ---
-- Display name overrides the greeting on /members (falls back to the
-- member's Google account name when null). Program is one of the fixed
-- options in src/lib/programs.ts (Full-Time MBA / FEMBA / EMBA), enforced in
-- the UI, not a DB constraint, so a new track doesn't need a migration.
-- Read-only on /admin/members; edited only by the member themselves.
-- google_name is different: not self-edited, and not shown to the member
-- themselves at all -- it's a copy of their Google account name, saved
-- automatically on sign-in (src/auth.ts), so the Member Directory has
-- something better than an email to show for anyone who hasn't set a
-- display_name yet (the site can only ever read the signed-in visitor's
-- own Google name live; this is what makes it available for everyone
-- else's view of the directory too). Safe to re-run.

alter table members
  add column if not exists display_name text,
  add column if not exists grad_year smallint,
  add column if not exists program text,
  add column if not exists linkedin_url text,
  add column if not exists google_name text;

-- --- Members-only tabs on /members (Recruiting / What's new / Directory / Showcase) ---
-- Recruiting resources, What's new and AnderTech Showcase are all built from
-- the same categories/resources tables above -- each category now belongs to
-- one of these three tabs (`section`, below), so a category is really "a
-- named block of links inside one tab" (e.g. Recruiting's "Resume bot"
-- category, holding one or more resume-bot links as its resources). The
-- Member Directory tab needs no table of its own -- it lists every row
-- already in `members`, using the profile fields above, automatically (no
-- admin work, so it isn't a fourth "section" here).

-- Existing categories default to 'recruiting': most of what was already in
-- the general resources list (Prepare, Find roles, Peers, Club insights)
-- reads as recruiting-related, and this is where the old standalone "Browse"
-- section on /members folded into. Move any category to a different tab any
-- time on /admin/categories.
alter table categories
  add column if not exists section text not null default 'recruiting'
    check (section in ('recruiting', 'whats-new', 'showcase'));

-- One settings row (id is always 1), just the embedded Looker Studio
-- dashboard link -- pinned above Recruiting's categories, not a resource
-- itself (an iframe embed isn't a plain link, so it needs its own field
-- rather than living in the resources table). Safe to re-run: the insert
-- only ever adds the one row, once.
create table if not exists recruiting_page (
  id int primary key default 1,
  dashboard_url text,
  check (id = 1)
);

insert into recruiting_page (id) values (1) on conflict (id) do nothing;

-- --- Member showcase projects (AnderTech Showcase tab on /members) ---
-- Members post their own projects (title, an external link, a short
-- description) from /members/profile/projects; they show on the Showcase tab
-- as an expandable list. Projects go live immediately -- only approved
-- members can post, and a member can edit or delete their own.
--
-- members.id is a stable, never-changing identifier, so rows that belong to a
-- member can point at it instead of at their email address. It is additive:
-- email is still members' primary key and how sign-in finds a member, and
-- member_roles still points at email. Existing members are backfilled with a
-- random id by the `add column` (a volatile default is evaluated per row).
-- Safe to re-run.

alter table members add column if not exists id uuid not null default gen_random_uuid();
create unique index if not exists members_id_key on members (id);

-- Limits (title <= 100 characters, description <= 250 words, 10 projects per
-- member) are enforced in the app, src/lib/showcase.ts; the character caps
-- below are only a backstop against a direct write. Deleting a member
-- deletes their projects with them.
create table if not exists showcase_projects (
  id bigserial primary key,
  member_id uuid not null references members(id) on delete cascade,
  title text not null check (char_length(title) <= 100),
  url text not null,
  description text not null default '' check (char_length(description) <= 2500),
  created_at timestamptz not null default now()
);

create index if not exists showcase_projects_member_idx on showcase_projects (member_id);

-- --- Newsletter (public /newsletter page, edited on /admin/newsletter) ---
-- An issue is a titled, dated list of news items with an optional intro above
-- them and closing below them; the editor ranks the items (position 1 shows
-- first). Issues start as drafts and only show on the public
-- page once published. title, body, tags and the image of an item are public;
-- editors_take is shown only to signed-in approved members (the query in
-- src/lib/newsletter-db.ts never selects it for anyone else). author_name is
-- backend-only on purpose: it is stored so repeat writers can be picked again
-- on /admin/newsletter, but no public or members page displays it yet. The
-- image lives in Vercel Blob; only its public URL is stored here.
-- Limits (lengths, tags per item) are enforced in the app,
-- src/lib/newsletter.ts; the checks below are only a backstop. Safe to re-run.
--
-- NOTE: an earlier draft of this feature had a different newsletter_items
-- table (tags in an array, no issues). If you already ran that, run
-- `drop table newsletter_items;` once first (it only held test data), then
-- run this again.
create table if not exists newsletter_issues (
  id bigserial primary key,
  title text not null check (char_length(title) <= 150),
  published_on date not null default current_date,
  published boolean not null default false,
  intro text not null default '' check (char_length(intro) <= 3000),
  closing text not null default '' check (char_length(closing) <= 3000),
  created_at timestamptz not null default now()
);

-- intro and closing were added after the first version of this table, so they
-- are also added separately for a database that already has it (no-op otherwise).
alter table newsletter_issues add column if not exists intro text not null default '' check (char_length(intro) <= 3000);
alter table newsletter_issues add column if not exists closing text not null default '' check (char_length(closing) <= 3000);

create index if not exists newsletter_issues_published_idx
  on newsletter_issues (published_on desc, id desc);

create table if not exists newsletter_items (
  id bigserial primary key,
  issue_id bigint not null references newsletter_issues(id) on delete cascade,
  position int not null,
  title text not null check (char_length(title) <= 150),
  body text not null check (char_length(body) <= 8000),
  editors_take text not null default '' check (char_length(editors_take) <= 4000),
  image_url text,
  image_alt text not null default '',
  author_name text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists newsletter_items_issue_idx
  on newsletter_items (issue_id, position, id);

-- Tags are created by editors (while writing an item, or on
-- /admin/newsletter/tags) and kept here so items can later be found by tag.
-- One tag name exists once, whatever its capitalisation. Deleting a tag
-- removes it from every item; deleting an item removes its tag links only.
create table if not exists newsletter_tags (
  id bigserial primary key,
  name text not null check (char_length(name) between 1 and 24),
  created_at timestamptz not null default now()
);

create unique index if not exists newsletter_tags_name_key
  on newsletter_tags (lower(name));

create table if not exists newsletter_item_tags (
  item_id bigint not null references newsletter_items(id) on delete cascade,
  tag_id bigint not null references newsletter_tags(id) on delete cascade,
  primary key (item_id, tag_id)
);

-- The primary key finds "tags of an item"; this finds "items with a tag".
create index if not exists newsletter_item_tags_tag_idx
  on newsletter_item_tags (tag_id, item_id);
