import Link from "next/link";
import { Icon } from "@/components/icons";
import { formatDay } from "@/lib/event-format";
import type {
  Announcement,
  DirectoryMember,
  RecruitingPage,
  ShowcasePost,
} from "@/lib/members-db";

// Four sections below the resource search on /members: Recruiting
// resources (default), What's new, Member Directory, AnderTech Showcase.
// Plain ?tab= links (like the category filters on /members/events), so
// switching tabs works without JavaScript and is a shareable URL. Only the
// active tab's data is ever fetched (see members/page.tsx) -- the other
// three tabs' queries never run on a given load.

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

const chipBase =
  "inline-flex min-h-10 shrink-0 items-center rounded-full border px-3.5 text-sm font-medium";
const chipOff =
  "border-zinc-200 bg-white text-zinc-600 hover:border-brand-blue dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400";
const chipOn =
  "border-brand-navy bg-brand-navy text-white dark:border-brand-gold dark:bg-brand-gold dark:text-brand-navy";

function TabsNav({ active }: { active: TabKey }) {
  return (
    <nav
      aria-label="Members sections"
      className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-2 md:mx-0 md:flex-wrap md:overflow-visible md:px-0"
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
          className={`${chipBase} ${active === t.key ? chipOn : chipOff}`}
        >
          {t.label}
        </Link>
      ))}
    </nav>
  );
}

const cardClass =
  "rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900";

const linkCardClass =
  "flex min-h-11 items-center justify-between gap-3 rounded-xl border border-zinc-200 px-4 py-3 text-sm font-medium hover:border-brand-blue hover:bg-brand-sky/40 dark:border-zinc-800 dark:hover:bg-white/5";

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-2xl border border-dashed border-zinc-300 p-6 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
      {children}
    </p>
  );
}

function LinkCard({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={linkCardClass}
    >
      {label}
      <Icon name="arrow" className="size-4 shrink-0 opacity-60" />
    </a>
  );
}

function RecruitingTab({ page }: { page: RecruitingPage }) {
  const toolkit = [
    { label: "Resume bot", href: page.resumeBotUrl },
    { label: "Cover letter", href: page.coverLetterUrl },
    { label: "Question bank", href: page.questionBankUrl },
    { label: "Playbooks", href: page.playbooksUrl },
  ].filter((t): t is { label: string; href: string } => Boolean(t.href));

  const hasAnything =
    page.dashboardUrl ||
    page.reportingUrl ||
    page.inviteOfferUrl ||
    toolkit.length > 0;

  if (!hasAnything) {
    return (
      <EmptyState>
        Recruiting resources are coming soon. Check back after the board
        fills this in on /admin.
      </EmptyState>
    );
  }

  return (
    <div className="grid gap-5">
      {page.dashboardUrl && (
        <div className="overflow-hidden rounded-2xl border border-zinc-200 shadow-sm dark:border-zinc-800">
          <iframe
            src={page.dashboardUrl}
            title="Recruiting dashboard"
            className="aspect-video w-full"
            loading="lazy"
          />
        </div>
      )}

      {(page.reportingUrl || page.inviteOfferUrl) && (
        <div className="grid gap-3 sm:grid-cols-2">
          {page.reportingUrl && (
            <LinkCard href={page.reportingUrl} label="Reporting survey" />
          )}
          {page.inviteOfferUrl && (
            <LinkCard
              href={page.inviteOfferUrl}
              label="Report an offer / invite a friend"
            />
          )}
        </div>
      )}

      {toolkit.length > 0 && (
        <div className={cardClass}>
          <p className="mb-3 text-sm font-semibold">Toolkit</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {toolkit.map((t) => (
              <LinkCard key={t.label} href={t.href} label={t.label} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function WhatsNewTab({ items }: { items: Announcement[] }) {
  if (items.length === 0) {
    return <EmptyState>No announcements yet.</EmptyState>;
  }
  return (
    <ul className="grid gap-3">
      {items.map((a) => (
        <li key={a.id} className={cardClass}>
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            {formatDay(a.created_at)}
          </p>
          <h3 className="mt-1 font-semibold tracking-tight">
            {a.url ? (
              <a
                href={a.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                {a.title}
              </a>
            ) : (
              a.title
            )}
          </h3>
          {a.body && (
            <p className="mt-1.5 text-sm text-zinc-700 dark:text-zinc-300">
              {a.body}
            </p>
          )}
        </li>
      ))}
    </ul>
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
        action="/members"
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
        <EmptyState>
          {needle ? `No members match "${dq}".` : "No members yet."}
        </EmptyState>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {visible.map((m) => (
            <li
              key={m.email}
              className="flex items-center justify-between gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">
                  {m.displayName || m.email}
                </p>
                {(m.program || m.gradYear) && (
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    {[m.program, m.gradYear].filter(Boolean).join(" · ")}
                  </p>
                )}
              </div>
              {m.linkedinUrl && (
                <a
                  href={m.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${m.displayName || m.email}'s LinkedIn`}
                  className="shrink-0 rounded-full border border-zinc-200 p-2 hover:border-brand-blue dark:border-zinc-700"
                >
                  <Icon name="linkedin" className="size-4" />
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ShowcaseTab({ items }: { items: ShowcasePost[] }) {
  if (items.length === 0) {
    return <EmptyState>No showcase posts yet.</EmptyState>;
  }
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {items.map((p) => (
        <li key={p.id} className={cardClass}>
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            {formatDay(p.created_at)}
            {p.member_name && ` · ${p.member_name}`}
          </p>
          <h3 className="mt-1 font-semibold tracking-tight">
            {p.url ? (
              <a
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                {p.title}
              </a>
            ) : (
              p.title
            )}
          </h3>
          {p.description && (
            <p className="mt-1.5 text-sm text-zinc-700 dark:text-zinc-300">
              {p.description}
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}

type Props =
  | { tab: "recruiting"; recruiting: RecruitingPage }
  | { tab: "whats-new"; announcements: Announcement[] }
  | { tab: "directory"; members: DirectoryMember[]; dq: string }
  | { tab: "showcase"; posts: ShowcasePost[] };

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
          <RecruitingTab page={props.recruiting} />
        )}
        {props.tab === "whats-new" && (
          <WhatsNewTab items={props.announcements} />
        )}
        {props.tab === "directory" && (
          <DirectoryTab members={props.members} dq={props.dq} />
        )}
        {props.tab === "showcase" && <ShowcaseTab items={props.posts} />}
      </div>
    </section>
  );
}
