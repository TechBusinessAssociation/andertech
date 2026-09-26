import { resourceKind } from "@/lib/resource-kind";
import type { MemberResource } from "@/lib/members-db";
import { Icon, IconTile } from "./icons";

// Big cards for the resources the board pinned (a checkbox on
// /admin/resources). Hidden entirely when nothing is pinned.
export function StartHere({ resources }: { resources: MemberResource[] }) {
  if (resources.length === 0) return null;

  return (
    <section aria-labelledby="start-here" className="pt-8 md:pt-10">
      <div className="mb-3.5">
        <h2 id="start-here" className="text-xl font-semibold tracking-tight">
          Start here
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Open these first. Picked by the board.
        </p>
      </div>
      <ul className="grid gap-3 md:grid-cols-3">
        {resources.map((resource) => {
          const kind = resourceKind(resource.url);
          const blurb = resource.description ?? resource.category_name;
          return (
            <li key={resource.id}>
              <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="grid h-full content-start gap-2.5 rounded-2xl border border-zinc-200 bg-white p-[18px] shadow-sm transition hover:-translate-y-0.5 hover:border-brand-blue motion-reduce:transition-none motion-reduce:hover:translate-y-0 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <span className="flex items-center justify-between">
                  <IconTile name={kind.icon} />
                  <span className="rounded-md border border-zinc-200 px-1.5 py-0.5 font-mono text-[11px] font-medium uppercase tracking-wide text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
                    {kind.label}
                  </span>
                </span>
                <span className="text-lg font-semibold tracking-tight">
                  {resource.label}
                </span>
                {blurb && (
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">
                    {blurb}
                  </span>
                )}
                <span className="mt-0.5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-blue dark:text-[#7dbbec]">
                  Open
                  <Icon name="arrow" className="h-4 w-4" />
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
