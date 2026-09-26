// Plain helpers shared by the /admin server actions. Kept in a normal module
// (not a "use server" file) so they stay ordinary functions.

// A whole number from a form field; anything else becomes `fallback`.
export function toInt(value: FormDataEntryValue | null, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
}

// Where to send the admin after an action, with an optional notice.
//
// `back` is a hidden field holding the page URL they were on (so a search or
// page number survives a Remove). It is only honoured if it stays inside
// `section` (e.g. "/admin/members") -- never an arbitrary redirect target.
export function backTo(
  formData: FormData,
  section: string,
  params: Record<string, string> = {},
): string {
  const raw = String(formData.get("back") ?? "");
  const base = raw.startsWith(section) ? raw : section;
  const url = new URL(base, "http://local.invalid");
  url.searchParams.delete("notice");
  url.searchParams.delete("count");
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return url.pathname + url.search;
}
