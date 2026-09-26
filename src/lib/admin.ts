import { hasRole } from "@/lib/members-db";

// ADMIN_EMAILS is the permanent backstop: a short, fixed list in an env var
// (set in Vercel), so the club can never lock itself out of /admin and there
// is always someone who can grant the admin role to others. These emails
// can't be removed from the /admin pages.
export function isEnvAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  if (!normalized) return false;

  const admins = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  return admins.includes(normalized);
}

// May this email use /admin? Yes if it is in ADMIN_EMAILS, or is a member
// holding the 'admin' role. Fails closed: a database error means "no".
export async function isAdmin(
  email: string | null | undefined,
): Promise<boolean> {
  if (isEnvAdminEmail(email)) return true;
  return await hasRole(email, "admin");
}
