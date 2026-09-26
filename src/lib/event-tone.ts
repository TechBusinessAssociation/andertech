// A color for each event category, shared by the "Next up" tiles on /members
// and the events list, so the same category is always the same color.
// Categories are free text (the board types them in /admin), so the known
// ones get a fixed color and any new one gets a stable color from its name
// (the same name always lands on the same color). The class names are written
// out in full so Tailwind can see them.

export type Tone = {
  // Tinted background + text: date chips and category pills.
  chip: string;
  // Solid color: the accent bar on an event card.
  bar: string;
};

const TONES: Tone[] = [
  {
    chip: "bg-brand-sky text-brand-blue dark:bg-[#14324d] dark:text-[#7dbbec]",
    bar: "bg-brand-blue",
  },
  {
    chip: "bg-brand-cream text-amber-700 dark:bg-[#33290f] dark:text-brand-gold",
    bar: "bg-brand-gold",
  },
  {
    chip: "bg-brand-navy/10 text-brand-navy dark:bg-white/10 dark:text-white",
    bar: "bg-brand-navy dark:bg-white/60",
  },
  {
    chip: "bg-teal-50 text-teal-700 dark:bg-[#0f2f2c] dark:text-teal-300",
    bar: "bg-teal-500",
  },
];

// Index into TONES for the categories the club uses today.
const KNOWN: Record<string, number> = {
  education: 0,
  social: 1,
  "recruiting event": 2,
  conference: 2,
  networking: 3,
  edi: 3,
};

export function categoryTone(category: string): Tone {
  const key = category.trim().toLowerCase();
  if (key in KNOWN) return TONES[KNOWN[key]];
  let sum = 0;
  for (const char of key) sum += char.charCodeAt(0);
  return TONES[sum % TONES.length];
}
