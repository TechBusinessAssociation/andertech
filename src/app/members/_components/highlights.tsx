import { Icon } from "@/components/icons";
import type { Highlight } from "@/lib/members-db";
import type { Section } from "@/lib/tab-sections";

// The 1-3 "editor's picks" at the top of a members tab (set on
// /admin/resources), each with the editor's note on why it's worth opening.
// Hidden entirely when the tab has none. Links open in a new tab, like every
// other resource link.
export function Highlights({
  items,
  section,
}: {
  items: Highlight[];
  section: Section;
}) {
  if (items.length === 0) return null;

  return (
    <section aria-labelledby={`highlights-${section}`}>
      <h3
        id={`highlights-${section}`}
        className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400"
      >
        Highlights
      </h3>
      <ul
        className={`grid gap-3 ${
          items.length === 1
            ? ""
            : items.length === 2
              ? "md:grid-cols-2"
              : "md:grid-cols-3"
        }`}
      >
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              data-umami-event="resource-click"
              data-umami-event-resource={item.label}
              data-umami-event-category={item.category_name}
              data-umami-event-from={`highlights-${section}`}
              className="flex h-full flex-col gap-2 rounded-2xl border border-zinc-200 border-l-4 border-l-brand-gold bg-white p-[18px] shadow-sm transition hover:border-brand-blue hover:border-l-brand-gold motion-reduce:transition-none dark:border-zinc-800 dark:border-l-brand-gold dark:bg-zinc-900"
            >
              {item.category_name && (
                <span className="text-xs font-medium text-zinc-500">
                  {item.category_name}
                </span>
              )}
              <span className="flex items-start justify-between gap-3">
                <span className="text-[17px] font-semibold tracking-tight">
                  {item.label}
                </span>
                <Icon
                  name="arrow"
                  className="mt-1 h-4 w-4 shrink-0 text-zinc-500"
                />
              </span>
              <span className="text-sm text-zinc-700 dark:text-zinc-300">
                {item.highlight_note}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
