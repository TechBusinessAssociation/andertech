import Link from "next/link";
import { Icon } from "@/components/icons";
import type { DirectoryMember, RecruitingPage, ResourceGroup } from "@/lib/members-db";
import { CategoryCards } from "./category-cards";

// Four sections above "Next up" on /members: Recruiting resources
// (default), What's new, Member Directory, AnderTech Showcase. Plain
// ?tab= links (like the category filters on /members/events), so
// switching tabs works without JavaScript and is a shareable URL. Only the
// active tab's data is ever fetched (see members/page.tsx's loadTab) -- the
// other three tabs' queries never run on a given load.
//
// Recruiting resources, What's new and AnderTech Showcase are all built the
// same way: categories + resources, pre-filtered to that tab's section
// (see schema.sql's comment on categories.section) and shown as category
// cards (<CategoryCards>) -- click a card to see its resources on their own
// page (/members/categories/[id]). Member Directory is its own thing --
// every approved member, automatically, not a category of links.

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
            // /members/profile). For anyone who hasn't yet, show just the
            // email's local part rather than printing their full address to
            // every other member.
            const name = m.displayName || m.email.split("@")[0];
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

type Props =
  | { tab: "recruiting"; recruiting: RecruitingPage; groups: ResourceGroup[] }
  | { tab: "whats-new"; groups: ResourceGroup[] }
  | { tab: "directory"; members: DirectoryMember[]; dq: string }
  | { tab: "showcase"; groups: ResourceGroup[] };

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
          <CategoryCards
            groups={props.groups}
            emptyMessage="No showcase posts yet. Add a category on /admin/categories (set its tab to AnderTech Showcase), then add resources to it on /admin/resources."
          />
        )}
      </div>
    </section>
  );
}
