// Tab highlights: up to MAX_HIGHLIGHTS resources per members tab, each with a
// short "why we picked it" note, shown above that tab's dashboard and
// categories. Set on /admin/resources; stored as highlight_rank (1..3) and
// highlight_note on the resources table.
export const MAX_HIGHLIGHTS = 3;
export const HIGHLIGHT_NOTE_MAX = 200;

export const HIGHLIGHT_RANKS = Array.from(
  { length: MAX_HIGHLIGHTS },
  (_, i) => i + 1,
);

// Reads the highlight fields of the resource form. Returns null for "not
// highlighted", "invalid" when the box is ticked but the note or position is
// missing or out of range (enforced here on the server, not just in the form).
export function readHighlight(
  formData: FormData,
): { rank: number; note: string } | null | "invalid" {
  if (formData.get("highlight") !== "on") return null;
  const rank = Number(formData.get("highlight_rank"));
  const note = String(formData.get("highlight_note") ?? "").trim();
  if (!HIGHLIGHT_RANKS.includes(rank)) return "invalid";
  if (!note || note.length > HIGHLIGHT_NOTE_MAX) return "invalid";
  return { rank, note };
}
