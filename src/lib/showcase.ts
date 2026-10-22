// Limits and checks for member showcase projects (see schema.sql). Shared by
// the form (counters) and the server actions (the real enforcement -- a form's
// maxLength can be bypassed by a direct POST).

export const MAX_TITLE_CHARS = 100;
export const MAX_DESCRIPTION_WORDS = 250;
// Backstop so one "word" can't be a megabyte; matches schema.sql's check.
export const MAX_DESCRIPTION_CHARS = 2500;
export const MAX_PROJECTS_PER_MEMBER = 10;

export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

// Links are rendered as href, so only allow http(s) -- never javascript: etc.
export function isHttpUrl(value: string): boolean {
  try {
    const { protocol } = new URL(value);
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
}

export type ProjectInput = {
  title: string;
  url: string;
  description: string;
};

// Returns an error code (shown by the projects page) or null when valid.
export type ProjectError = "title" | "url" | "words";

export function validateProject(input: ProjectInput): ProjectError | null {
  if (!input.title || input.title.length > MAX_TITLE_CHARS) return "title";
  if (!isHttpUrl(input.url)) return "url";
  if (
    countWords(input.description) > MAX_DESCRIPTION_WORDS ||
    input.description.length > MAX_DESCRIPTION_CHARS
  ) {
    return "words";
  }
  return null;
}
