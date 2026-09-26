import { sql } from "@vercel/postgres";
import { site } from "../../content/site";

// Account requests: someone asks for an account (name + UCLA Google address),
// an admin approves or rejects. Approving adds them to the members list.

// Stops the table growing without bound if someone floods the public form.
export const MAX_PENDING_REQUESTS = 500;

const DOMAIN = site.requestEmailDomain.toLowerCase();

// Returns the lowercased address if it is exactly `something@<domain>`, else
// null. Deliberately strict: one "@", a plain local part, and the domain must
// match exactly (so "x@g.ucla.edu.evil.com" and "x@evilg.ucla.edu" fail).
export function normalizeRequestEmail(raw: string): string | null {
  const email = raw.trim().toLowerCase();
  if (email.length === 0 || email.length > 100) return null;
  const at = email.indexOf("@");
  if (at < 1 || at !== email.lastIndexOf("@")) return null;
  if (email.slice(at + 1) !== DOMAIN) return null;
  return /^[a-z0-9][a-z0-9._+-]*$/.test(email.slice(0, at)) ? email : null;
}

// Trims and collapses whitespace; 1 to 100 characters, else null.
export function cleanRequestName(raw: string): string | null {
  const name = raw.replace(/\s+/g, " ").trim();
  return name.length >= 1 && name.length <= 100 ? name : null;
}

// Files a request. People who are already members are skipped silently (the
// caller shows everyone the same "received" message, so the form never reveals
// who is a member). A pending request is left alone; a rejected one, or an
// approved one whose member was later removed, goes back to pending.
export async function submitAccessRequest(
  name: string,
  email: string,
): Promise<"ok" | "busy"> {
  const { rows } = await sql`
    select count(*)::int as n from access_requests where status = 'pending'
  `;
  if (((rows[0]?.n as number) ?? 0) >= MAX_PENDING_REQUESTS) return "busy";

  await sql`
    insert into access_requests (email, name)
    select ${email}::text, ${name}::text
    where not exists (select 1 from members where email = ${email})
    on conflict (email) do update
      set name = excluded.name, status = 'pending', created_at = now(),
          decided_at = null, decided_by = null
      where access_requests.status <> 'pending'
  `;
  return "ok";
}

export type AccessRequest = {
  id: number;
  email: string;
  name: string;
  status: "pending" | "approved" | "rejected";
  requested: string;
  decided: string | null;
  decided_by: string | null;
};

// Everything below is admin-only: callers must have passed requireAdmin().

// Postgres error 42P01, "undefined_table": the table hasn't been created, i.e.
// the latest schema.sql was never run against this database.
function isMissingTable(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    (error as { code?: string }).code === "42P01"
  );
}

// `setupNeeded` is true when the access_requests table doesn't exist yet, so
// the admin page can say how to fix it instead of crashing. Any other database
// error is still thrown.
export async function getAccessRequests(): Promise<{
  pending: AccessRequest[];
  decided: AccessRequest[];
  setupNeeded: boolean;
}> {
  try {
    const pending = await sql`
      select id, email, name, status, decided_by,
             to_char(created_at at time zone 'America/Los_Angeles', 'Mon FMDD, FMHH12:MI AM') as requested,
             null::text as decided
      from access_requests where status = 'pending'
      order by created_at asc
    `;
    const decided = await sql`
      select id, email, name, status, decided_by,
             to_char(created_at at time zone 'America/Los_Angeles', 'Mon FMDD, FMHH12:MI AM') as requested,
             to_char(decided_at at time zone 'America/Los_Angeles', 'Mon FMDD, FMHH12:MI AM') as decided
      from access_requests where status <> 'pending'
      order by decided_at desc nulls last
      limit 20
    `;
    return {
      pending: pending.rows as AccessRequest[],
      decided: decided.rows as AccessRequest[],
      setupNeeded: false,
    };
  } catch (error) {
    if (isMissingTable(error)) {
      return { pending: [], decided: [], setupNeeded: true };
    }
    throw error;
  }
}

// For the badge in the admin menu. Fails to 0 so a database hiccup never
// breaks an admin page.
export async function countPendingRequests(): Promise<number> {
  try {
    const { rows } = await sql`
      select count(*)::int as n from access_requests where status = 'pending'
    `;
    return (rows[0]?.n as number) ?? 0;
  } catch {
    return 0;
  }
}

// One statement, so it is atomic: mark the request approved (only if it is
// still pending, so a double click does nothing), add the email to members and
// give it the club-member role.
export async function approveRequest(id: number, actor: string): Promise<void> {
  await sql`
    with req as (
      update access_requests
      set status = 'approved', decided_at = now(), decided_by = ${actor}
      where id = ${id} and status = 'pending'
      returning email
    ),
    added as (
      insert into members (email) select email from req
      on conflict (email) do nothing
    )
    insert into member_roles (email, role)
    select email, 'club-member' from req
    on conflict do nothing
  `;
}

export async function rejectRequest(id: number, actor: string): Promise<void> {
  await sql`
    update access_requests
    set status = 'rejected', decided_at = now(), decided_by = ${actor}
    where id = ${id} and status = 'pending'
  `;
}
