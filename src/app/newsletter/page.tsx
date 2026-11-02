import Link from "next/link";
import { auth } from "@/auth";
import { Analytics } from "@/components/analytics";
import { displayFont } from "@/components/home/ui";
import { IssueList } from "@/components/newsletter/issue-list";
import { IssueView, formatIssueDate } from "@/components/newsletter/issue-view";
import { SiteFooter } from "@/components/site-footer";
import { isApprovedMember } from "@/lib/members-db";
import { getIssueItems, getPublishedIssues } from "@/lib/newsletter-db";
import { newsletter } from "../../../content/newsletter";

export const metadata = { title: "Newsletter" };

// Public page. It reads the session only to decide whether to include the
// Editor's take: the take is fetched from the database only for approved
// members (src/lib/newsletter-db.ts), so a signed-out visitor's page never
// contains it. This makes /newsletter render per request; the landing page
// is untouched and stays static.
//
// It always opens on the newest issue (never on a list, which would look
// empty with only a few issues). Older issues are reached from the "All
// issues" menu by the date and the previous-issue link at the bottom; both
// only appear once there is more than one issue. Both use <details>, like the
// header's account menu, so they work without JavaScript.
type Props = { searchParams: Promise<{ issue?: string }> };

// Shared look for the two <details> toggles.
const toggleClass =
  "cursor-pointer list-none text-zinc-500 underline decoration-zinc-300 underline-offset-[3px] hover:text-brand-navy dark:text-zinc-400 dark:decoration-zinc-700 dark:hover:text-white [&::-webkit-details-marker]:hidden";

export default async function NewsletterPage({ searchParams }: Props) {
  const { issue: issueParam } = await searchParams;
  const session = await auth();
  const isMember = await isApprovedMember(session?.user?.email);

  // Only published issues exist as far as this page is concerned (newest
  // first). ?issue= opens an older one; an unknown or unpublished id falls
  // back to the newest.
  const issues = await getPublishedIssues();
  const index = Math.max(
    0,
    issues.findIndex((candidate) => candidate.id === Number(issueParam)),
  );
  const issue = issues[index];
  const items = issue ? await getIssueItems(issue.id, isMember) : [];
  const hasArchive = issues.length > 1;
  // The next older issue; on the oldest one, point back to the latest.
  const older = issues[index + 1];
  const next = older
    ? { label: "Previous issue", issue: older }
    : index > 0
      ? { label: "Latest issue", issue: issues[0] }
      : null;

  return (
    <main className={`${displayFont.variable} flex-1`}>
      <Analytics />
      <div className="mx-auto max-w-[680px] px-4 pb-20">
        <header className="flex flex-col items-center gap-2 border-b border-zinc-200 pb-6 pt-10 text-center dark:border-zinc-800">
          <h1 className="font-display text-[2rem] font-extrabold leading-none tracking-[-0.04em] text-brand-navy md:text-[2.75rem] dark:text-white">
            {newsletter.name}
            <span aria-hidden="true" className="text-brand-gold">
              .
            </span>
          </h1>
          <p className="text-[15px] text-zinc-500 dark:text-zinc-400">
            {newsletter.tagline}
          </p>
        </header>

        <div className="pt-10">
          {issue ? (
            <IssueView
              issue={issue}
              items={items}
              trackReading
              meta={
                hasArchive && (
                  <details className="relative">
                    <summary className={toggleClass}>
                      All issues ({issues.length})
                    </summary>
                    <div className="absolute left-0 top-full z-10 mt-2 max-h-80 w-[min(20rem,calc(100vw-2rem))] overflow-auto rounded-lg border border-zinc-200 bg-white p-1.5 text-base shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
                      <IssueList issues={issues} currentId={issue.id} />
                    </div>
                  </details>
                )
              }
            />
          ) : (
            <p className="text-lg text-zinc-600 dark:text-zinc-400">
              The first issue is on its way. Check back soon.
            </p>
          )}
        </div>

        {issue && next && (
          <nav aria-label="More issues" className="pt-10">
            <p className="mb-1 text-sm text-zinc-500 dark:text-zinc-400">
              {next.label} &middot; {formatIssueDate(next.issue.publishedOn)}
            </p>
            <Link
              href={`/newsletter?issue=${next.issue.id}`}
              className="text-lg font-semibold text-brand-navy hover:underline dark:text-white"
            >
              {next.issue.title} &rarr;
            </Link>
            {issues.length > 2 && (
              <details className="mt-3.5 text-sm">
                <summary className={toggleClass}>
                  See all {issues.length} issues
                </summary>
                <div className="mt-2 text-base">
                  <IssueList issues={issues} currentId={issue.id} />
                </div>
              </details>
            )}
          </nav>
        )}
      </div>
      <SiteFooter />
    </main>
  );
}
