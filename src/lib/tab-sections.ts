// Which of the members-tabs a category belongs to (see schema.sql's comment
// on categories.section). Member Directory isn't here -- it lists every
// approved member automatically, not a category of resources.
export const SECTIONS = ["recruiting", "whats-new", "showcase"] as const;

export type Section = (typeof SECTIONS)[number];

export const SECTION_LABELS: Record<Section, string> = {
  recruiting: "Recruiting resources",
  "whats-new": "What's new",
  showcase: "AnderTech Showcase",
};

// The sections an admin can file a category under. Showcase is left out: it
// lists member-posted projects now (see src/lib/showcase-db.ts), not categories.
// It stays in SECTIONS only because the database check still allows it.
export const ADMIN_SECTIONS = SECTIONS.filter((s) => s !== "showcase");

export function isSection(value: string): value is Section {
  return (SECTIONS as readonly string[]).includes(value);
}
