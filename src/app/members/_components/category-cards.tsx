import Link from "next/link";
import { Icon, IconTile } from "@/components/icons";
import type { ResourceGroup } from "@/lib/members-db";
import { categoryIcon, resourceKind } from "@/lib/resource-kind";

// How many of a category's resources show when its card is opened; the rest
// are one click away on the category's own page (/members/categories/[id]).
const PREVIEW_COUNT = 5;

// The categories, as cards that open in place: clicking one drops down its
// first PREVIEW_COUNT resources (in the order set on /admin), plus a "See all"
// link to the category page when there are more. A plain <details>, so it
// works without JavaScript, like the other dropdowns on the site. No search
// or filter chips on purpose: with only a handful of categories per tab,
// browsing the cards directly is simpler than filtering them.
export function CategoryCards({
  groups,
  emptyMessage,
}: {
  groups: ResourceGroup[];
  emptyMessage: string;
}) {
  if (groups.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-zinc-300 p-5 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
        {emptyMessage}
      </p>
    );
  }

  return (
    // items-start: an open card grows on its own, without stretching its
    // neighbour into an empty box.
    <div className="grid items-start gap-3 sm:grid-cols-2">
      {groups.map((group) => {
        // "Other" (no category id -- see ResourceGroup's comment) has no page
        // to link to, so it shows every resource instead of a "See all".
        const shown = group.id
          ? group.resources.slice(0, PREVIEW_COUNT)
          : group.resources;
        const more = group.resources.length - shown.length;

        return (
          <details
            key={group.name}
            className="group rounded-2xl border border-zinc-200 bg-white shadow-sm open:border-brand-blue dark:border-zinc-800 dark:bg-zinc-900 dark:open:border-brand-blue"
          >
            <summary
              data-umami-event="category-expand"
              data-umami-event-category={group.name}
              className="flex cursor-pointer list-none items-center gap-3.5 rounded-2xl p-[18px] hover:bg-brand-sky/40 dark:hover:bg-white/5 [&::-webkit-details-marker]:hidden"
            >
              <IconTile name={categoryIcon(group.name)} />
              <div className="min-w-0 flex-1">
                <h3 className="text-[17px] font-semibold tracking-tight">
                  {group.name}
                </h3>
                {group.description && (
                  <p className="text-[13px] text-zinc-600 dark:text-zinc-400">
                    {group.description}
                  </p>
                )}
              </div>
              <span className="shrink-0 text-xs text-zinc-500 tabular-nums">
                {group.resources.length}
              </span>
              <span
                aria-hidden="true"
                className="shrink-0 text-zinc-500 transition-transform group-open:rotate-180 motion-reduce:transition-none"
              >
                &#9662;
              </span>
            </summary>

            <div className="border-t border-zinc-200 px-2 pb-2 pt-1 dark:border-zinc-800">
              <ul>
                {shown.map((resource) => {
                  const kind = resourceKind(resource.url);
                  return (
                    <li key={resource.id}>
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-umami-event="resource-click"
                        data-umami-event-resource={resource.label}
                        data-umami-event-category={group.name}
                        data-umami-event-from="category-dropdown"
                        className="grid min-h-11 grid-cols-[1fr_auto] items-center gap-3 rounded-[10px] px-2.5 py-2 hover:bg-brand-sky dark:hover:bg-white/5"
                      >
                        <span className="min-w-0">
                          <span className="block text-[14.5px] font-medium">
                            {resource.label}
                          </span>
                          {resource.description && (
                            <span className="block truncate text-[13px] text-zinc-600 dark:text-zinc-400">
                              {resource.description}
                            </span>
                          )}
                        </span>
                        <span className="flex items-center gap-1.5 text-xs text-zinc-500">
                          {kind.label}
                          <Icon name="arrow" className="h-4 w-4" />
                        </span>
                      </a>
                    </li>
                  );
                })}
              </ul>
              {more > 0 && group.id && (
                <Link
                  href={`/members/categories/${group.id}`}
                  className="mt-1 flex min-h-11 items-center gap-1.5 rounded-[10px] px-2.5 text-sm font-semibold text-[#2c6597] hover:bg-brand-sky dark:text-[#7dbbec] dark:hover:bg-white/5"
                >
                  See all {group.resources.length} in {group.name}
                  <span aria-hidden="true">&rarr;</span>
                </Link>
              )}
            </div>
          </details>
        );
      })}
    </div>
  );
}
