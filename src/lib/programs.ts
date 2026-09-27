// Anderson's MBA tracks, shown as a fixed dropdown on /members/profile.
// Stored as plain text (see schema.sql's comment on the members table), so
// adding a new track later is just adding a line here -- no migration.
export const PROGRAMS = ["Full-Time MBA", "FEMBA", "EMBA"] as const;

export type Program = (typeof PROGRAMS)[number];

export function isProgram(value: string): value is Program {
  return (PROGRAMS as readonly string[]).includes(value);
}
