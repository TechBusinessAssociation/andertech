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

export function isSection(value: string): value is Section {
  return (SECTIONS as readonly string[]).includes(value);
}
