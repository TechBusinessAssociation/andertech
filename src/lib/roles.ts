// The fixed list of member roles. To add one, add it here (and give it a
// label); the /admin/members page and the database pick it up from this list.
export const ROLES = ["club-member", "admin"] as const;

export type Role = (typeof ROLES)[number];

export const DEFAULT_ROLE: Role = "club-member";

export const ROLE_LABELS: Record<Role, string> = {
  "club-member": "Club member",
  admin: "Admin",
};

export function isRole(value: string): value is Role {
  return (ROLES as readonly string[]).includes(value);
}

// Keeps only known roles, de-duplicated. Falls back to the default role
// when nothing valid is left, so a member never ends up with no role.
export function cleanRoles(values: readonly string[]): Role[] {
  const valid = [...new Set(values.filter(isRole))];
  return valid.length > 0 ? valid : [DEFAULT_ROLE];
}
