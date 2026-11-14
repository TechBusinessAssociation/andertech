import type { Highlight } from "@/lib/members-db";
import { resourceKind } from "@/lib/resource-kind";
import type { Section } from "@/lib/tab-sections";

// Who picks each tab's highlights (Recruiting: the recruiting-editor role;
// What's new: admins), named in the section heading and on the lead card.
const PICKED_BY: Record<Section, string> = {
  recruiting: "the recruiting team",
  "whats-new": "the board",
  showcase: "the board",
};

// The 1-3 "editor's picks" at the top of a members tab (set on
// /admin/resources). Rank 1 is the lead: a large navy card with the reason
// set as a quote and the page's one gold button, so it's obvious what to
// open first. Ranks 2-3 sit stacked beside it (below it on phones). Hidden
// entirely when the tab has none. Links open in a new tab.
export function Highlights({
  items,
  section,
}: {
  items: Highlight[];
  section: Section;
}) {
  if (items.length === 0) return null;
  const [lead, ...rest] = items;
  const leadKind = resourceKind(lead.url);
  const by = PICKED_BY[section];

  const track = (item: Highlight) => ({
    "data-umami-event": "resource-click",
    "data-umami-event-resource": item.label,
    "data-umami-event-category": item.category_name ?? undefined,
    "data-umami-event-from": `highlights-${section}`,
  });

  return (
    <section aria-labelledby={`highlights-${section}`}>
      <div className="mb-3 flex items-baseline justify-between gap-4">
        <h3
          id={`highlights-${section}`}
          className="text-base font-semibold text-brand-navy dark:text-white"
        >
          Picked by {by}
        </h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Start with these
        </p>
      </div>

      <div
        className={`grid gap-3 ${rest.length > 0 ? "md:grid-cols-[2fr_1fr]" : ""}`}
      >
        <article className="flex flex-col rounded-2xl bg-brand-navy p-5 text-white md:p-7 dark:ring-1 dark:ring-white/10">
          {lead.category_name && (
            <span className="text-sm text-[#b9c8d6]">{lead.category_name}</span>
          )}
          <h4 className="mt-2.5 max-w-[16ch] font-display text-[30px] font-bold leading-[1.04] tracking-[-0.03em] text-balance md:text-[40px]">
            {lead.label}
          </h4>
          <p className="mt-6 text-sm text-brand-gold">
            Why {by} picked it
          </p>
          <blockquote className="mt-1.5 max-w-[42ch] text-[17px] leading-[1.45] text-[#e6edf4] md:text-xl">
            {lead.highlight_note}
          </blockquote>
          <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 pt-6">
            <a
              href={lead.url}
              target="_blank"
              rel="noopener noreferrer"
              {...track(lead)}
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-brand-gold px-5 font-semibold text-brand-navy transition hover:brightness-105 active:translate-y-px motion-reduce:transition-none"
            >
              Open {lead.label.length <= 28 ? lead.label : "it"}
              <span aria-hidden="true">&#8599;</span>
            </a>
            <span className="text-sm text-[#b9c8d6]">
              {leadKind.label} · opens in a new tab
            </span>
          </div>
        </article>

        {rest.length > 0 && (
          <ul className="grid gap-3">
            {rest.map((item) => (
              <li key={item.id} className="flex">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  {...track(item)}
                  className="flex w-full flex-col rounded-2xl bg-brand-sky/70 p-[18px] transition hover:bg-brand-sky motion-reduce:transition-none dark:bg-white/5 dark:hover:bg-white/10"
                >
                  {item.category_name && (
                    <span className="text-[13px] text-zinc-600 dark:text-zinc-400">
                      {item.category_name}
                    </span>
                  )}
                  <span className="mt-1 text-[17px] font-semibold leading-snug text-brand-navy dark:text-white">
                    {item.label}
                  </span>
                  <span className="mt-1.5 text-sm text-zinc-700 dark:text-zinc-300">
                    {item.highlight_note}
                  </span>
                  <span className="mt-auto pt-2.5 text-sm font-semibold text-[#2c6597] dark:text-[#7dbbec]">
                    Open <span aria-hidden="true">&#8599;</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
