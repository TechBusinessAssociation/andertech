import Link from "next/link";
import type { ResourceGroup } from "@/lib/members-db";
import { categoryIcon, resourceKind } from "@/lib/resource-kind";
import { Icon, IconTile } from "@/components/icons";

// Search and category filters are plain links and a GET form, so they work
// without JavaScript and the URL can be shared (?cat=Prepare&q=resume).
function hrefFor(cat: string | null, q: string): string {
  const params = new URLSearchParams();
  if (cat) params.set("cat", cat);
  if (q) params.set("q", q);
  const qs = params.toString();
  return `/members${qs ? `?${qs}` : ""}#browse`;
}

const chipBase =
  "inline-flex min-h-10 shrink-0 items-center rounded-full border px-3.5 text-sm font-medium";
const chipOff =
  "border-zinc-200 bg-white text-zinc-600 hover:border-brand-blue dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400";
const chipOn =
  "border-brand-navy bg-brand-navy text-white dark:border-brand-gold dark:bg-brand-gold dark:text-brand-navy";

export function Browse({
  groups,
  q,
  cat,
}: {
  groups: ResourceGroup[];
  q: string;
  cat: string | null;
}) {
  const needle = q.trim().toLowerCase();
  const visible = groups
    .filter((group) => !cat || group.name === cat)
    .map((group) => ({
      ...group,
      resources: group.resources.filter(
        (resource) =>
          !needle ||
          `${resource.label} ${resource.description ?? ""} ${group.name}`
            .toLowerCase()
            .includes(needle),
      ),
    }))
    .filter((group) => group.resources.length > 0);

  return (
    <section id="browse" aria-labelledby="browse-heading" className="scroll-mt-4 pt-8 md:pt-10">
      <h2 id="browse-heading" className="mb-3.5 text-xl font-semibold tracking-tight">
        Browse everything
      </h2>

      {groups.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-zinc-300 p-5 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
          No resources yet.
        </p>
      ) : (
        <>
          <div className="mb-3.5 grid gap-2.5 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
            <form
              action="/members#browse"
              method="get"
              role="search"
              className="flex min-h-12 items-center gap-2.5 rounded-xl border border-zinc-200 bg-white pl-3.5 pr-1.5 focus-within:border-brand-blue dark:border-zinc-800 dark:bg-zinc-900"
            >
              <Icon name="search" className="h-5 w-5 text-zinc-500" />
              <input
                type="search"
                name="q"
                defaultValue={q}
                placeholder="Search resources"
                aria-label="Search resources"
                autoComplete="off"
                className="min-h-11 min-w-0 flex-1 bg-transparent outline-none placeholder:text-zinc-500"
              />
              {cat && <input type="hidden" name="cat" value={cat} />}
              <button
                type="submit"
                className="min-h-10 rounded-lg px-3.5 text-sm font-medium text-brand-blue hover:bg-brand-sky dark:text-[#7dbbec] dark:hover:bg-white/10"
              >
                Search
              </button>
            </form>

            <nav
              aria-label="Filter by category"
              className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 md:mx-0 md:px-0"
            >
              <Link
                href={hrefFor(null, q)}
                aria-current={cat ? undefined : "true"}
                className={`${chipBase} ${cat ? chipOff : chipOn}`}
              >
                All
              </Link>
              {groups.map((group) => (
                <Link
                  key={group.name}
                  href={hrefFor(group.name, q)}
                  aria-current={cat === group.name ? "true" : undefined}
                  className={`${chipBase} ${cat === group.name ? chipOn : chipOff}`}
                >
                  {group.name}
                </Link>
              ))}
            </nav>
          </div>

          {visible.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-zinc-300 p-5 text-center text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
              No resources match that search.{" "}
              <Link
                href={hrefFor(null, "")}
                className="font-medium text-brand-blue underline dark:text-[#7dbbec]"
              >
                Clear filters
              </Link>
            </p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {visible.map((group) => (
                <section
                  key={group.name}
                  aria-label={group.name}
                  className="grid content-start gap-3 rounded-2xl border border-zinc-200 bg-white p-[18px] shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <header className="flex items-center gap-3">
                    <IconTile name={categoryIcon(group.name)} />
                    <div className="min-w-0">
                      <h3 className="text-[17px] font-semibold tracking-tight">
                        {group.name}
                      </h3>
                      {group.description && (
                        <p className="text-[13px] text-zinc-600 dark:text-zinc-400">
                          {group.description}
                        </p>
                      )}
                    </div>
                    <span className="ml-auto font-mono text-xs text-zinc-500">
                      {group.resources.length}
                    </span>
                  </header>
                  <ul className="grid gap-0.5">
                    {group.resources.map((resource) => {
                      const kind = resourceKind(resource.url);
                      return (
                        <li key={resource.id}>
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="-mx-2 grid min-h-[52px] grid-cols-[auto_1fr_auto] items-center gap-3 rounded-[10px] px-2 py-2.5 hover:bg-brand-sky dark:hover:bg-white/5"
                          >
                            <IconTile name={kind.icon} size="sm" />
                            <span className="min-w-0">
                              <span className="block text-[14.5px] font-medium">
                                {resource.label}
                              </span>
                              <span className="block text-[13px] text-zinc-600 dark:text-zinc-400">
                                {resource.description ?? kind.label}
                              </span>
                            </span>
                            <Icon name="arrow" className="h-5 w-5 text-zinc-500" />
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}
