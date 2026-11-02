// Limits and validation for the newsletter. Plain module (no database, no
// "use server") so the admin forms, the server actions and the page can share
// it. Enforced in the server actions, not just the form.

export const MAX_ISSUE_TITLE = 150;
export const MAX_INTRO = 3000;
export const MAX_CLOSING = 3000;
export const MAX_TITLE = 150;
export const MAX_BODY = 8000;
export const MAX_TAKE = 4000;
export const MAX_TAGS_PER_ITEM = 8;
export const MAX_TAG_LENGTH = 24;
export const MAX_ALT = 200;

// The browser shrinks photos before upload (see image-field.tsx); this is the
// server-side backstop and sits well under the 4 MB server-action body limit.
export const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const DATE = /^\d{4}-\d{2}-\d{2}$/;

export type IssueInput = {
  title: string;
  publishedOn: string; // YYYY-MM-DD
  intro: string; // shown under the issue title, above the items (optional)
  closing: string; // shown below the items (optional)
};

export function validateIssue(input: IssueInput): boolean {
  return (
    input.title.length > 0 &&
    input.title.length <= MAX_ISSUE_TITLE &&
    input.intro.length <= MAX_INTRO &&
    input.closing.length <= MAX_CLOSING &&
    DATE.test(input.publishedOn)
  );
}

export type ItemInput = {
  title: string;
  body: string;
  editorsTake: string;
  imageAlt: string;
  authorName: string;
};

export function validateItem(input: ItemInput): boolean {
  return (
    input.title.length > 0 &&
    input.title.length <= MAX_TITLE &&
    input.body.length > 0 &&
    input.body.length <= MAX_BODY &&
    input.editorsTake.length <= MAX_TAKE &&
    input.imageAlt.length <= MAX_ALT
  );
}

// "AI, Product, Recruiting" -> ["AI", "Product", "Recruiting"]. Case-insensitive
// duplicates are dropped. Returns null if any name is too long.
export function parseTagNames(raw: string): string[] | null {
  const seen = new Set<string>();
  const names: string[] = [];
  for (const part of raw.split(",")) {
    const name = part.trim().replace(/\s+/g, " ");
    if (!name) continue;
    if (name.length > MAX_TAG_LENGTH) return null;
    if (seen.has(name.toLowerCase())) continue;
    seen.add(name.toLowerCase());
    names.push(name);
  }
  return names;
}
