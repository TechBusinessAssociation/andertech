import { sql } from "@vercel/postgres";

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

export type MemberResource = {
  id: number;
  label: string;
  url: string;
  description: string | null;
  category_id: number | null;
  category_name: string | null;
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
      select r.id, r.label, r.url, r.description, r.category_id,
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

// --- Admin-only from here down. Callers (src/app/admin/page.tsx) are
// responsible for checking isAdminEmail first -- these do no
// authorization themselves.

export async function addMembers(emails: string[]): Promise<number> {
  const normalized = [
    ...new Set(
      emails.map((e) => e.trim().toLowerCase()).filter((e) => e.includes("@")),
    ),
  ];
  for (const email of normalized) {
    await sql`
      insert into members (email) values (${email})
      on conflict (email) do nothing
    `;
  }
  return normalized.length;
}

export async function removeMember(email: string): Promise<void> {
  const normalized = email.trim().toLowerCase();
  await sql`delete from members where email = ${normalized}`;
}

export async function searchMembers(
  query: string,
  limit = 50,
): Promise<string[]> {
  const pattern = `%${query.trim().toLowerCase()}%`;
  const { rows } = await sql`
    select email from members
    where email like ${pattern}
    order by email asc
    limit ${limit}
  `;
  return rows.map((row) => row.email as string);
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
           c.name as category_name
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
}): Promise<boolean> {
  const label = input.label.trim();
  const url = cleanUrl(input.url);
  if (!label || !url) return false;
  await sql`
    insert into resources (label, url, description, category_id, sort_order)
    values (${label}, ${url}, ${emptyToNull(input.description)},
            ${input.categoryId}, ${input.sortOrder})
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

// All events (past included), so admins can fix or delete old ones.
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
    limit 300
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
