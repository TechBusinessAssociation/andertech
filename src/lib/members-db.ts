import { sql } from "@vercel/postgres";

// Reads/writes the membership allow-list and member-only resource links
// in Vercel Postgres. Nothing here is in the repo -- see schema.sql for
// the one-time table setup, and src/app/admin/page.tsx for how the
// board actually edits this day to day (never raw SQL).
//
// The public-facing reads (isApprovedMember, getMemberResources) fail
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

export type MemberResource = { id: number; label: string; url: string };

export async function getMemberResources(): Promise<MemberResource[]> {
  try {
    const { rows } = await sql`
      select id, label, url from resources order by label asc
    `;
    return rows as MemberResource[];
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

export async function addResource(label: string, url: string): Promise<void> {
  const trimmedLabel = label.trim();
  const trimmedUrl = url.trim();
  if (!trimmedLabel || !trimmedUrl) return;
  await sql`
    insert into resources (label, url) values (${trimmedLabel}, ${trimmedUrl})
  `;
}

export async function removeResource(id: number): Promise<void> {
  await sql`delete from resources where id = ${id}`;
}
