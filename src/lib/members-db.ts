import { sql } from "@vercel/postgres";
import type { Role } from "@/lib/roles";

// Reads/writes the membership allow-list, member-only resource links (and
// their categories) and members-only events in Vercel Postgres. Nothing here is in the repo -- see schema.sql for
// the one-time table setup, and src/app/admin/page.tsx for how the
// board actually edits this day to day (never raw SQL).
//
// The public-facing reads (isApprovedMember, getResourceGroups, getUpcomingEvents) fail
// closed: any DB error returns false/[] rather than throwing, so a
// database hiccup denies access instead of accidentally granting it.
// The admin mutations below don't need that -- a thrown error on
// /admin, which only admins ever see, is fine as-is.

export async function isApprovedMember(
  email: string | null | undefined,
): Promise<boolean> {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  if (!normalized) return false;

  try {
    const { rows } = await sql`
      select 1 from members where email = ${normalized} limit 1
    `;
    return rows.length > 0;
  } catch {
    return false;
  }
}

export type MemberProfile = {
  displayName: string | null;
  gradYear: number | null;
  program: string | null;
  linkedinUrl: string | null;
};

// Self-service profile fields (see schema.sql's comment on the members
// table). Only the member themselves edits these, on /members/profile.
export async function getMemberProfile(
  email: string,
): Promise<MemberProfile> {
  const normalized = email.trim().toLowerCase();
  try {
    const { rows } = await sql`
      select display_name, grad_year, program, linkedin_url
      from members where email = ${normalized} limit 1
    `;
    const row = rows[0];
    return {
      displayName: (row?.display_name as string | null) ?? null,
      gradYear: (row?.grad_year as number | null) ?? null,
      program: (row?.program as string | null) ?? null,
      linkedinUrl: (row?.linkedin_url as string | null) ?? null,
    };
  } catch {
    return { displayName: null, gradYear: null, program: null, linkedinUrl: null };
  }
}

export async function updateMemberProfile(
  email: string,
  profile: MemberProfile,
): Promise<void> {
  const normalized = email.trim().toLowerCase();
  await sql`
    update members
    set display_name = ${profile.displayName},
        grad_year = ${profile.gradYear},
        program = ${profile.program},
        linkedin_url = ${profile.linkedinUrl}
    where email = ${normalized}
  `;
}

// Every approved member, for the Member Directory tab on /members. A name
// only shows if that member has set one on their own profile -- there is no
// other source for it (we can only ever read the signed-in visitor's own
// Google name, never anyone else's), so this fills in gradually as members
// visit /members/profile, not all at once.
export type DirectoryMember = {
  email: string;
  displayName: string | null;
  gradYear: number | null;
  program: string | null;
  linkedinUrl: string | null;
};

export async function getDirectoryMembers(): Promise<DirectoryMember[]> {
  try {
    const { rows } = await sql`
      select email, display_name, grad_year, program, linkedin_url
      from members
      order by coalesce(display_name, email) asc
    `;
    return rows.map((row) => ({
      email: row.email as string,
      displayName: (row.display_name as string | null) ?? null,
      gradYear: (row.grad_year as number | null) ?? null,
      program: (row.program as string | null) ?? null,
      linkedinUrl: (row.linkedin_url as string | null) ?? null,
    }));
  } catch {
    return [];
  }
}

export type MemberResource = {
  id: number;
  label: string;
  url: string;
  description: string | null;
  category_id: number | null;
  category_name: string | null;
  featured: boolean;
};

export type ResourceGroup = {
  name: string;
  description: string | null;
  resources: MemberResource[];
};

// Groups follow categories.sort_order; resources with no category (only
// possible for rows created before categories existed) land in "Other".
export async function getResourceGroups(): Promise<ResourceGroup[]> {
  try {
    const { rows } = await sql`
      select r.id, r.label, r.url, r.description, r.category_id, r.featured,
             c.name as category_name, c.description as category_description
      from resources r
      left join categories c on c.id = r.category_id
      order by c.sort_order asc nulls last, c.name asc, r.sort_order asc, r.label asc
    `;
    const groups: ResourceGroup[] = [];
    for (const row of rows) {
      const name = (row.category_name as string | null) ?? "Other";
      let group = groups.find((g) => g.name === name);
      if (!group) {
        group = {
          name,
          description: (row.category_description as string | null) ?? null,
          resources: [],
        };
        groups.push(group);
      }
      group.resources.push(row as MemberResource);
    }
    return groups;
  } catch {
    return [];
  }
}

// Resources the board pinned to the "Start here" row, in category order.
export async function getFeaturedResources(): Promise<MemberResource[]> {
  try {
    const { rows } = await sql`
      select r.id, r.label, r.url, r.description, r.category_id, r.featured,
             c.name as category_name
      from resources r
      left join categories c on c.id = r.category_id
      where r.featured
      order by c.sort_order asc nulls last, r.sort_order asc, r.label asc
      limit 6
    `;
    return rows as MemberResource[];
  } catch {
    return [];
  }
}

export type MemberEvent = {
  id: number;
  title: string;
  category: string;
  event_date: string; // YYYY-MM-DD
  start_time: string | null; // HH:MM
  end_time: string | null; // HH:MM
  location: string | null;
  description: string | null;
  url: string | null;
};

// to_char keeps dates/times as plain strings: node-postgres would otherwise
// turn a `date` into a JS Date and shift it by the server's timezone.

// "Today" is LA time (all events are in LA), not the server's UTC clock.
export async function getUpcomingEvents(): Promise<MemberEvent[]> {
  try {
    const { rows } = await sql`
      select
        id, title, category,
        to_char(event_date, 'YYYY-MM-DD') as event_date,
        to_char(start_time, 'HH24:MI') as start_time,
        to_char(end_time, 'HH24:MI') as end_time,
        location, description, url
      from events
      where event_date >= (now() at time zone 'America/Los_Angeles')::date
      order by event_date asc, start_time asc nulls first, title asc
    `;
    return rows as MemberEvent[];
  } catch {
    return [];
  }
}

// --- Roles. Admin access is decided in src/lib/admin.ts (ADMIN_EMAILS env var
// OR the 'admin' role below); these are just the queries.

export async function hasRole(
  email: string | null | undefined,
  role: Role,
): Promise<boolean> {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  if (!normalized) return false;
  try {
    const { rows } = await sql`
      select 1 from member_roles
      where email = ${normalized} and role = ${role} limit 1
    `;
    return rows.length > 0;
  } catch {
    return false;
  }
}

// --- Admin-only from here down. Every caller must have passed
// requireAdmin() (src/lib/require-admin.ts) -- these do no authorization
// themselves.

// Roles are passed to SQL as one comma-separated string (and split back with
// string_to_array) so the whole change is a single statement -- atomic, and no
// array-parameter serialization to depend on.
function csv(values: readonly string[]): string {
  return values.join(",");
}

// Adds members and gives each of them the given roles (existing members keep
// their current roles and gain these). One statement, however many emails.
export async function addMembers(
  emails: string[],
  roles: readonly Role[],
): Promise<number> {
  const normalized = [
    ...new Set(
      emails
        .map((e) => e.trim().toLowerCase())
        .filter((e) => e.includes("@") && !e.includes(",")),
    ),
  ];
  if (normalized.length === 0) return 0;
  await sql`
    with input as (
      select unnest(string_to_array(${csv(normalized)}::text, ',')) as email
    ),
    added as (
      insert into members (email) select email from input
      on conflict (email) do nothing
    )
    insert into member_roles (email, role)
    select i.email, r
    from input i, unnest(string_to_array(${csv(roles)}::text, ',')) as r
    on conflict do nothing
  `;
  return normalized.length;
}

// Replaces a member's roles with exactly this set (never empty -- callers
// pass roles through cleanRoles).
export async function setMemberRoles(
  email: string,
  roles: readonly Role[],
): Promise<void> {
  const normalized = email.trim().toLowerCase();
  await sql`
    with wanted as (
      select unnest(string_to_array(${csv(roles)}::text, ',')) as role
    ),
    removed as (
      delete from member_roles
      where email = ${normalized}
        and role not in (select role from wanted)
    )
    insert into member_roles (email, role)
    select ${normalized}::text, role from wanted
    where exists (select 1 from members where email = ${normalized})
    on conflict do nothing
  `;
}

export async function removeMember(email: string): Promise<void> {
  const normalized = email.trim().toLowerCase();
  await sql`delete from members where email = ${normalized}`;
}

export type MemberRow = {
  email: string;
  roles: string[];
  display_name: string | null;
  grad_year: number | null;
  program: string | null;
};

export const MEMBERS_PAGE_SIZE = 10;

// One page of members (with their roles), optionally filtered by a plain
// substring of the email. strpos, not LIKE, so % and _ in a search are literal.
export async function listMembers(
  query: string,
  page: number,
): Promise<{ rows: MemberRow[]; total: number; page: number; pages: number }> {
  const needle = query.trim().toLowerCase();
  const { rows: countRows } = await sql`
    select count(*)::int as count from members
    where ${needle} = '' or strpos(email, ${needle}) > 0
  `;
  const total = (countRows[0]?.count as number) ?? 0;
  const pages = Math.max(1, Math.ceil(total / MEMBERS_PAGE_SIZE));
  const current = Math.min(Math.max(1, Math.trunc(page) || 1), pages);

  const { rows } = await sql`
    select m.email, m.display_name, m.grad_year, m.program,
           coalesce(
             array_agg(r.role order by r.role) filter (where r.role is not null),
             '{}'
           ) as roles
    from members m
    left join member_roles r on r.email = m.email
    where ${needle} = '' or strpos(m.email, ${needle}) > 0
    group by m.email
    order by m.email asc
    limit ${MEMBERS_PAGE_SIZE} offset ${(current - 1) * MEMBERS_PAGE_SIZE}
  `;
  return { rows: rows as MemberRow[], total, page: current, pages };
}

export async function countMembers(): Promise<number> {
  try {
    const { rows } = await sql`select count(*)::int as count from members`;
    return (rows[0]?.count as number) ?? 0;
  } catch {
    return 0;
  }
}

// Links are rendered as href, so only allow http(s) -- never javascript: etc.
function cleanUrl(value: string): string | null {
  const trimmed = value.trim();
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "http:" || parsed.protocol === "https:"
      ? trimmed
      : null;
  } catch {
    return null;
  }
}

function emptyToNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export type Category = {
  id: number;
  name: string;
  description: string | null;
  sort_order: number;
};

export async function getCategories(): Promise<Category[]> {
  const { rows } = await sql`
    select id, name, description, sort_order from categories
    order by sort_order asc, name asc
  `;
  return rows as Category[];
}

export type CategoryWithCount = Category & { resource_count: number };

export async function getCategoriesWithCounts(): Promise<CategoryWithCount[]> {
  const { rows } = await sql`
    select c.id, c.name, c.description, c.sort_order,
           count(r.id)::int as resource_count
    from categories c
    left join resources r on r.category_id = c.id
    group by c.id
    order by c.sort_order asc, c.name asc
  `;
  return rows as CategoryWithCount[];
}

export async function addCategory(
  name: string,
  description: string,
  sortOrder: number,
): Promise<void> {
  const trimmed = name.trim();
  if (!trimmed) return;
  await sql`
    insert into categories (name, description, sort_order)
    values (${trimmed}, ${emptyToNull(description)}, ${sortOrder})
    on conflict (name) do nothing
  `;
}

export async function updateCategory(
  id: number,
  name: string,
  description: string,
  sortOrder: number,
): Promise<void> {
  const trimmed = name.trim();
  if (!trimmed) return;
  await sql`
    update categories
    set name = ${trimmed}, description = ${emptyToNull(description)},
        sort_order = ${sortOrder}
    where id = ${id}
  `;
}

// Returns false (and deletes nothing) while any resource still uses it.
// The foreign key is the backstop; this makes the refusal a clean message.
export async function removeCategory(id: number): Promise<boolean> {
  const result = await sql`
    delete from categories
    where id = ${id}
      and not exists (select 1 from resources where category_id = ${id})
  `;
  return (result.rowCount ?? 0) > 0;
}

export type AdminResource = MemberResource & { sort_order: number };

export async function getAdminResources(): Promise<AdminResource[]> {
  const { rows } = await sql`
    select r.id, r.label, r.url, r.description, r.category_id, r.sort_order,
           r.featured, c.name as category_name
    from resources r
    left join categories c on c.id = r.category_id
    order by c.sort_order asc nulls last, c.name asc, r.sort_order asc, r.label asc
  `;
  return rows as AdminResource[];
}

export async function addResource(input: {
  label: string;
  url: string;
  description: string;
  categoryId: number;
  sortOrder: number;
  featured: boolean;
}): Promise<boolean> {
  const label = input.label.trim();
  const url = cleanUrl(input.url);
  if (!label || !url) return false;
  await sql`
    insert into resources
      (label, url, description, category_id, sort_order, featured)
    values (${label}, ${url}, ${emptyToNull(input.description)},
            ${input.categoryId}, ${input.sortOrder}, ${input.featured})
  `;
  return true;
}

export async function updateResource(
  id: number,
  input: {
    label: string;
    url: string;
    description: string;
    categoryId: number;
    sortOrder: number;
    featured: boolean;
  },
): Promise<boolean> {
  const label = input.label.trim();
  const url = cleanUrl(input.url);
  if (!label || !url) return false;
  await sql`
    update resources
    set label = ${label}, url = ${url},
        description = ${emptyToNull(input.description)},
        category_id = ${input.categoryId}, sort_order = ${input.sortOrder},
        featured = ${input.featured}
    where id = ${id}
  `;
  return true;
}

export async function removeResource(id: number): Promise<void> {
  await sql`delete from resources where id = ${id}`;
}

export const DEFAULT_EVENT_CATEGORIES = [
  "Education",
  "Networking",
  "Social",
  "EDI",
];

export async function getEventCategories(): Promise<string[]> {
  const { rows } = await sql`select distinct category from events`;
  const used = rows.map((r) => r.category as string);
  return [...new Set([...DEFAULT_EVENT_CATEGORIES, ...used])].sort();
}

// All events, past included (the admin page splits upcoming from past).
export async function getAdminEvents(): Promise<MemberEvent[]> {
  const { rows } = await sql`
    select
      id, title, category,
      to_char(event_date, 'YYYY-MM-DD') as event_date,
      to_char(start_time, 'HH24:MI') as start_time,
      to_char(end_time, 'HH24:MI') as end_time,
      location, description, url
    from events
    order by event_date asc, start_time asc nulls first, title asc
    limit 500
  `;
  return rows as MemberEvent[];
}

export type EventInput = {
  title: string;
  category: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  location: string;
  description: string;
  url: string;
};

function validEvent(input: EventInput) {
  const title = input.title.trim();
  const category = input.category.trim();
  if (!title || !category) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.eventDate)) return null;
  const time = /^\d{2}:\d{2}$/;
  const start = time.test(input.startTime) ? input.startTime : null;
  const end = start && time.test(input.endTime) ? input.endTime : null;
  const rawUrl = input.url.trim();
  const url = rawUrl ? cleanUrl(rawUrl) : null;
  if (rawUrl && !url) return null;
  return {
    title,
    category,
    date: input.eventDate,
    start,
    end,
    location: emptyToNull(input.location),
    description: emptyToNull(input.description),
    url,
  };
}

export async function addEvent(input: EventInput): Promise<boolean> {
  const e = validEvent(input);
  if (!e) return false;
  await sql`
    insert into events
      (title, category, event_date, start_time, end_time, location, description, url)
    values
      (${e.title}, ${e.category}, ${e.date}, ${e.start}, ${e.end},
       ${e.location}, ${e.description}, ${e.url})
  `;
  return true;
}

export async function updateEvent(
  id: number,
  input: EventInput,
): Promise<boolean> {
  const e = validEvent(input);
  if (!e) return false;
  await sql`
    update events
    set title = ${e.title}, category = ${e.category}, event_date = ${e.date},
        start_time = ${e.start}, end_time = ${e.end}, location = ${e.location},
        description = ${e.description}, url = ${e.url}
    where id = ${id}
  `;
  return true;
}

export async function removeEvent(id: number): Promise<void> {
  await sql`delete from events where id = ${id}`;
}

// --- Recruiting tab settings (a single row, id = 1 -- see schema.sql) ---

export type RecruitingPage = {
  dashboardUrl: string | null;
  reportingUrl: string | null;
  inviteOfferUrl: string | null;
  resumeBotUrl: string | null;
  coverLetterUrl: string | null;
  questionBankUrl: string | null;
  playbooksUrl: string | null;
};

const EMPTY_RECRUITING_PAGE: RecruitingPage = {
  dashboardUrl: null,
  reportingUrl: null,
  inviteOfferUrl: null,
  resumeBotUrl: null,
  coverLetterUrl: null,
  questionBankUrl: null,
  playbooksUrl: null,
};

export async function getRecruitingPage(): Promise<RecruitingPage> {
  try {
    const { rows } = await sql`
      select dashboard_url, reporting_url, invite_offer_url, resume_bot_url,
             cover_letter_url, question_bank_url, playbooks_url
      from recruiting_page where id = 1
    `;
    const row = rows[0];
    if (!row) return EMPTY_RECRUITING_PAGE;
    return {
      dashboardUrl: row.dashboard_url as string | null,
      reportingUrl: row.reporting_url as string | null,
      inviteOfferUrl: row.invite_offer_url as string | null,
      resumeBotUrl: row.resume_bot_url as string | null,
      coverLetterUrl: row.cover_letter_url as string | null,
      questionBankUrl: row.question_bank_url as string | null,
      playbooksUrl: row.playbooks_url as string | null,
    };
  } catch {
    return EMPTY_RECRUITING_PAGE;
  }
}

export async function updateRecruitingPage(
  page: RecruitingPage,
): Promise<void> {
  const u = (value: string | null) => (value ? cleanUrl(value) : null);
  await sql`
    insert into recruiting_page
      (id, dashboard_url, reporting_url, invite_offer_url, resume_bot_url,
       cover_letter_url, question_bank_url, playbooks_url)
    values
      (1, ${u(page.dashboardUrl)}, ${u(page.reportingUrl)}, ${u(page.inviteOfferUrl)},
       ${u(page.resumeBotUrl)}, ${u(page.coverLetterUrl)}, ${u(page.questionBankUrl)},
       ${u(page.playbooksUrl)})
    on conflict (id) do update set
      dashboard_url = excluded.dashboard_url,
      reporting_url = excluded.reporting_url,
      invite_offer_url = excluded.invite_offer_url,
      resume_bot_url = excluded.resume_bot_url,
      cover_letter_url = excluded.cover_letter_url,
      question_bank_url = excluded.question_bank_url,
      playbooks_url = excluded.playbooks_url
  `;
}

// --- What's new: a short manual announcement feed ---

export type Announcement = {
  id: number;
  title: string;
  body: string | null;
  url: string | null;
  created_at: string;
};

export async function getAnnouncements(limit = 20): Promise<Announcement[]> {
  try {
    const { rows } = await sql`
      select id, title, body, url, to_char(created_at, 'YYYY-MM-DD') as created_at
      from announcements
      order by created_at desc
      limit ${limit}
    `;
    return rows as Announcement[];
  } catch {
    return [];
  }
}

export type AnnouncementInput = { title: string; body: string; url: string };

function validAnnouncement(input: AnnouncementInput) {
  const title = input.title.trim();
  if (!title) return null;
  const rawUrl = input.url.trim();
  const url = rawUrl ? cleanUrl(rawUrl) : null;
  if (rawUrl && !url) return null;
  return { title, body: emptyToNull(input.body), url };
}

export async function addAnnouncement(
  input: AnnouncementInput,
): Promise<boolean> {
  const a = validAnnouncement(input);
  if (!a) return false;
  await sql`
    insert into announcements (title, body, url)
    values (${a.title}, ${a.body}, ${a.url})
  `;
  return true;
}

export async function updateAnnouncement(
  id: number,
  input: AnnouncementInput,
): Promise<boolean> {
  const a = validAnnouncement(input);
  if (!a) return false;
  await sql`
    update announcements
    set title = ${a.title}, body = ${a.body}, url = ${a.url}
    where id = ${id}
  `;
  return true;
}

export async function removeAnnouncement(id: number): Promise<void> {
  await sql`delete from announcements where id = ${id}`;
}

// --- AnderTech Showcase: member projects/achievements the board posts ---

export type ShowcasePost = {
  id: number;
  title: string;
  description: string | null;
  member_name: string | null;
  url: string | null;
  created_at: string;
};

export async function getShowcasePosts(limit = 20): Promise<ShowcasePost[]> {
  try {
    const { rows } = await sql`
      select id, title, description, member_name, url,
             to_char(created_at, 'YYYY-MM-DD') as created_at
      from showcase_posts
      order by created_at desc
      limit ${limit}
    `;
    return rows as ShowcasePost[];
  } catch {
    return [];
  }
}

export type ShowcasePostInput = {
  title: string;
  description: string;
  memberName: string;
  url: string;
};

function validShowcasePost(input: ShowcasePostInput) {
  const title = input.title.trim();
  if (!title) return null;
  const rawUrl = input.url.trim();
  const url = rawUrl ? cleanUrl(rawUrl) : null;
  if (rawUrl && !url) return null;
  return {
    title,
    description: emptyToNull(input.description),
    memberName: emptyToNull(input.memberName),
    url,
  };
}

export async function addShowcasePost(
  input: ShowcasePostInput,
): Promise<boolean> {
  const p = validShowcasePost(input);
  if (!p) return false;
  await sql`
    insert into showcase_posts (title, description, member_name, url)
    values (${p.title}, ${p.description}, ${p.memberName}, ${p.url})
  `;
  return true;
}

export async function updateShowcasePost(
  id: number,
  input: ShowcasePostInput,
): Promise<boolean> {
  const p = validShowcasePost(input);
  if (!p) return false;
  await sql`
    update showcase_posts
    set title = ${p.title}, description = ${p.description},
        member_name = ${p.memberName}, url = ${p.url}
    where id = ${id}
  `;
  return true;
}

export async function removeShowcasePost(id: number): Promise<void> {
  await sql`delete from showcase_posts where id = ${id}`;
}
