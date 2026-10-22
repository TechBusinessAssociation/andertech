import Link from "next/link";
import { Icon } from "@/components/icons";
import type { DirectoryMember, RecruitingPage, ResourceGroup } from "@/lib/members-db";
import type { ShowcaseProject } from "@/lib/showcase-db";
import { CategoryCards } from "./category-cards";

// Four sections above "Next up" on /members: Recruiting resources
// (default), What's new, Member Directory, AnderTech Showcase. Plain
// ?tab= links (like the category filters on /members/events), so
// switching tabs works without JavaScript and is a shareable URL. Only the
// active tab's data is ever fetched (see members/page.tsx's loadTab) -- the
// other three tabs' queries never run on a given load.
//
// Recruiting resources and What's new are built the same way: categories + resources, pre-filtered to that tab's section
// (see schema.sql's comment on categories.section) and shown as category
// cards (<CategoryCards>) -- click a card to see its resources on their own
// page (/members/categories/[id]). Member Directory is its own thing --
// every approved member, automatically, not a category of links. AnderTech
// Showcase is too: projects members post themselves from
// /members/profile/projects, shown as an expandable list.

export const TABS = [
  { key: "recruiting", label: "Recruiting resources" },
  { key: "whats-new", label: "What's new" },
  { key: "directory", label: "Member Directory" },
  { key: "showcase", label: "AnderTech Showcase" },
] as const;

export type TabKey = (typeof TABS)[number]["key"];

export function isTabKey(value: string | undefined): value is TabKey {
  return TABS.some((t) => t.key === value);
}

// An underlined tab strip (not the pill-shaped category cards below) --
// these are real, distinct sections rather than filters over one list, so
// they read more clearly as tabs.
function TabsNav({ active }: { active: TabKey }) {
  return (
    <nav
      aria-label="Members sections"
      className="-mx-5 flex gap-1 overflow-x-auto border-b border-zinc-200 px-5 md:mx-0 md:px-0 dark:border-zinc-800"
    >
      {TABS.map((t) => (
        <Link
          key={t.key}
          href={
            t.key === "recruiting"
              ? "/members#member-tabs"
              : `/members?tab=${t.key}#member-tabs`
          }
          aria-current={active === t.key ? "page" : undefined}
          className={`-mb-px whitespace-nowrap border-b-2 px-3.5 py-2.5 text-sm font-medium sm:px-4 ${
            active === t.key
              ? "border-brand-navy text-brand-navy dark:border-brand-gold dark:text-brand-gold"
              : "border-transparent text-zinc-600 hover:border-zinc-300 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          }`}
        >
          {t.label}
        </Link>
      ))}
    </nav>
  );
}

function RecruitingTab({
  dashboardUrl,
  groups,
}: {
  dashboardUrl: string | null;
  groups: ResourceGroup[];
}) {
  return (
    <div className="grid gap-5">
      {dashboardUrl && (
        <div className="overflow-hidden rounded-2xl border border-zinc-200 shadow-sm dark:border-zinc-800">
          <iframe
            src={dashboardUrl}
            title="Recruiting dashboard"
            className="aspect-video w-full"
            loading="lazy"
          />
        </div>
      )}
      <CategoryCards
        groups={groups}
        emptyMessage="Recruiting resources are coming soon. Add a category on /admin/categories (set its tab to Recruiting resources), then add resources to it on /admin/resources."
      />
    </div>
  );
}

function DirectoryTab({
  members,
  dq,
}: {
  members: DirectoryMember[];
  dq: string;
}) {
  const needle = dq.trim().toLowerCase();
  const visible = needle
    ? members.filter((m) =>
        `${m.displayName ?? ""} ${m.email} ${m.program ?? ""}`
          .toLowerCase()
          .includes(needle),
      )
    : members;

  return (
    <div className="grid gap-4">
      <form
        action="/members#member-tabs"
        className="flex gap-2"
        aria-label="Search the member directory"
      >
        <input type="hidden" name="tab" value="directory" />
        <input
          type="search"
          name="dq"
          defaultValue={dq}
          placeholder="Search by name or program"
          className="min-h-11 w-full max-w-sm rounded-lg border border-zinc-300 px-3 text-sm dark:border-zinc-700 dark:bg-zinc-900"
        />
        <button
          type="submit"
          className="min-h-11 shrink-0 rounded-lg border border-zinc-300 px-4 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          Search
        </button>
      </form>

      {visible.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-zinc-300 p-6 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
          {needle ? `No members match "${dq}".` : "No members yet."}
        </p>
      ) : (
        <ul className="divide-y divide-zinc-200 rounded-2xl border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">
          {visible.map((m) => {
            // Display name wins when a member has set one (self-service, on
            // /members/profile). Otherwise their Google account name, saved
            // automatically on sign-in (src/auth.ts). Only if neither exists
            // yet (e.g. they've never signed in since this was added) does
            // this fall back to just the email's local part, rather than
            // printing their full address to every other member.
            const name =
              m.displayName || m.googleName || m.email.split("@")[0];
            return (
              <li
                key={m.email}
                className="flex items-center justify-between gap-3 px-4 py-3"
              >
                <p className="min-w-0 truncate font-medium">{name}</p>
                <div className="flex shrink-0 items-center gap-3">
                  {(m.program || m.gradYear) && (
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">
                      {[m.program, m.gradYear].filter(Boolean).join(" · ")}
                    </span>
                  )}
                  {m.linkedinUrl && (
                    <a
                      href={m.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${name}'s LinkedIn`}
                      className="rounded-full border border-zinc-200 p-2 hover:border-brand-blue dark:border-zinc-700"
                    >
                      <Icon name="linkedin" className="size-4" />
                    </a>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

// One row per project: title and author on the summary line, and clicking it
// expands the description underneath. A plain <details>/<summary> (no JS, same
// pattern as the header menu). The external link is a separate box-and-arrow
// button pinned to the row's right edge, outside the <summary>, so it works
// straight away without expanding and never fights the row's own click.
// Descriptions render as plain text (whitespace kept), never as HTML.
function ShowcaseTab({ projects }: { projects: ShowcaseProject[] }) {
  if (projects.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-zinc-300 p-6 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
        No projects yet. Be the first: add one from{" "}
        <Link href="/members/profile/projects" className="underline">
          your profile
        </Link>
        .
      </p>
    );
  }

  return (
    <div className="grid gap-4">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Projects from AnderTech members. Click a row to read more, or the arrow to open it.{" "}
        <Link href="/members/profile/projects" className="underline">
          Share yours
        </Link>
        .
      </p>
      <ul className="divide-y divide-zinc-200 rounded-2xl border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">
        {projects.map((p) => (
          <li key={p.id} className="relative">
            <a
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Open ${p.title} in a new tab`}
              className="absolute right-3 top-2.5 z-10 inline-flex size-11 items-center justify-center rounded-lg border border-zinc-200 text-brand-navy hover:border-brand-blue hover:bg-zinc-50 dark:border-zinc-700 dark:text-brand-gold dark:hover:bg-zinc-800"
            >
              <Icon name="external" className="size-5" />
            </a>
            <details className="group">
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 py-3 pl-4 pr-16 marker:hidden [&::-webkit-details-marker]:hidden">
                <span className="min-w-0">
                  <span className="block font-medium">{p.title}</span>
                  <span className="block text-sm text-zinc-600 dark:text-zinc-400">
                    {p.authorName}
                  </span>
                </span>
                <span
                  aria-hidden="true"
                  className="shrink-0 text-zinc-500 transition-transform group-open:rotate-180"
                >
                  &#9662;
                </span>
              </summary>
              <div className="px-4 pb-4 pr-16">
                <p className="whitespace-pre-line text-[15px] text-zinc-700 dark:text-zinc-300">
                  {p.description || "No description added."}
                </p>
              </div>
            </details>
          </li>
        ))}
      </ul>
    </div>
  );
}

type Props =
  | { tab: "recruiting"; recruiting: RecruitingPage; groups: ResourceGroup[] }
  | { tab: "whats-new"; groups: ResourceGroup[] }
  | { tab: "directory"; members: DirectoryMember[]; dq: string }
  | { tab: "showcase"; projects: ShowcaseProject[] };

export function MemberTabs(props: Props) {
  return (
    <section
      aria-labelledby="member-tabs-heading"
      className="pt-10 md:pt-14"
      id="member-tabs"
    >
      <h2 id="member-tabs-heading" className="sr-only">
        More on the members portal
      </h2>
      <TabsNav active={props.tab} />
      <div className="mt-5">
        {props.tab === "recruiting" && (
          <RecruitingTab
            dashboardUrl={props.recruiting.dashboardUrl}
            groups={props.groups}
          />
        )}
        {props.tab === "whats-new" && (
          <CategoryCards
            groups={props.groups}
            emptyMessage="No announcements yet. Add a category on /admin/categories (set its tab to What's new), then add resources to it on /admin/resources."
          />
        )}
        {props.tab === "directory" && (
          <DirectoryTab members={props.members} dq={props.dq} />
        )}
        {props.tab === "showcase" && (
          <ShowcaseTab projects={props.projects} />
        )}
      </div>
    </section>
  );
}
