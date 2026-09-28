import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Icon, IconTile } from "@/components/icons";
import { getCategoryDetail, isApprovedMember } from "@/lib/members-db";
import { categoryIcon, resourceKind } from "@/lib/resource-kind";
import { SECTION_LABELS } from "@/lib/tab-sections";

type Props = {
  params: Promise<{ id: string }>;
};

// A category's own resource list -- what a category card on /members links
// to (Recruiting resources / What's new / AnderTech Showcase tabs). Same
// live sign-in re-check as every other /members page.
export default async function CategoryPage({ params }: Props) {
  const session = await auth();
  const email = session?.user?.email;

  if (!email || !(await isApprovedMember(email))) {
    redirect("/sign-in");
  }

  const { id } = await params;
  const category = await getCategoryDetail(Number(id));
  if (!category) {
    redirect("/members");
  }

  const backHref =
    category.section === "recruiting"
      ? "/members#member-tabs"
      : `/members?tab=${category.section}#member-tabs`;

  return (
    <main className="flex-1">
      <div className="mx-auto max-w-2xl px-5 py-8 md:py-12">
        <Link
          href={backHref}
          className="inline-flex min-h-11 items-center text-sm font-medium text-brand-navy/80 hover:underline dark:text-white/80"
        >
          &larr; {SECTION_LABELS[category.section]}
        </Link>

        <div className="mt-2 flex items-center gap-3.5">
          <IconTile name={categoryIcon(category.name)} />
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight text-balance md:text-3xl">
              {category.name}
            </h1>
            {category.description && (
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {category.description}
              </p>
            )}
          </div>
        </div>

        {category.resources.length === 0 ? (
          <p className="mt-6 rounded-2xl border border-dashed border-zinc-300 p-6 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
            No resources here yet.
          </p>
        ) : (
          <ul className="mt-6 grid gap-0.5 rounded-2xl border border-zinc-200 bg-white p-2 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            {category.resources.map((resource) => {
              const kind = resourceKind(resource.url);
              return (
                <li key={resource.id}>
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="grid min-h-[52px] grid-cols-[auto_1fr_auto] items-center gap-3 rounded-[10px] px-2 py-2.5 hover:bg-brand-sky dark:hover:bg-white/5"
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
        )}
      </div>
    </main>
  );
}
