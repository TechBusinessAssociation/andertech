// Checks whether an email may use /admin. A short, fixed list in an env
// var, not the members database -- there should only ever be a handful
// of admins, so this doesn't need real storage or a UI of its own.
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  if (!normalized) return false;

  const admins = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  return admins.includes(normalized);
}
