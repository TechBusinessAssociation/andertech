import Link from "next/link";
import { Icon, IconTile } from "@/components/icons";
import type { ResourceGroup } from "@/lib/members-db";
import { categoryIcon } from "@/lib/resource-kind";

// Just the categories, as clickable cards -- click one to see its
// resources on its own page (/members/categories/[id]). No search or
// filter chips here on purpose: with only a handful of categories per tab,
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
    <div className="grid gap-3 sm:grid-cols-2">
      {groups.map((group) => {
        const inner = (
          <>
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
            <span className="shrink-0 font-mono text-xs text-zinc-500">
              {group.resources.length}
            </span>
          </>
        );

        // "Other" (no category id -- see ResourceGroup's comment) has no
        // page to link to, so it just shows as a plain, non-clickable card.
        return group.id ? (
          <Link
            key={group.name}
            href={`/members/categories/${group.id}`}
            className="flex items-center gap-3.5 rounded-2xl border border-zinc-200 bg-white p-[18px] shadow-sm hover:border-brand-blue hover:bg-brand-sky/40 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-white/5"
          >
            {inner}
            <Icon name="arrow" className="h-5 w-5 shrink-0 text-zinc-500" />
          </Link>
        ) : (
          <div
            key={group.name}
            className="flex items-center gap-3.5 rounded-2xl border border-zinc-200 bg-white p-[18px] shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
          >
            {inner}
          </div>
        );
      })}
    </div>
  );
}
