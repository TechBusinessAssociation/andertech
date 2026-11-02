import Link from "next/link";
import { auth } from "@/auth";
import { Analytics } from "@/components/analytics";
import { HeroBand } from "@/components/hero-band";
import { IssueView, formatIssueDate } from "@/components/newsletter/issue-view";
import { SiteFooter } from "@/components/site-footer";
import { isApprovedMember } from "@/lib/members-db";
import { getIssueItems, getPublishedIssues } from "@/lib/newsletter-db";

export const metadata = { title: "Newsletter" };

// Public page. It reads the session only to decide whether to include the
// Editor's take: the take is fetched from the database only for approved
// members (src/lib/newsletter-db.ts), so a signed-out visitor's page never
// contains it. This makes /newsletter render per request; the landing page
// is untouched and stays static.
type Props = { searchParams: Promise<{ issue?: string }> };

export default async function NewsletterPage({ searchParams }: Props) {
  const { issue: issueParam } = await searchParams;
  const session = await auth();
  const isMember = await isApprovedMember(session?.user?.email);

  // Only published issues exist as far as this page is concerned. The newest
  // shows by default; ?issue= opens an older one (an unknown or unpublished id
  // falls back to the newest).
  const issues = await getPublishedIssues();
  const issue =
    issues.find((candidate) => candidate.id === Number(issueParam)) ??
    issues[0];
  const items = issue ? await getIssueItems(issue.id, isMember) : [];
  const pastIssues = issues.filter((candidate) => candidate.id !== issue?.id);

  return (
    <main className="flex-1">
      <Analytics />
      <HeroBand labelledBy="newsletter-heading">
        <div className="mx-auto max-w-5xl px-5 py-8 md:py-12">
          <h1
            id="newsletter-heading"
            className="text-4xl font-semibold leading-[1.05] tracking-tight text-balance md:text-5xl"
          >
            Newsletter
          </h1>
          <p className="mt-3 max-w-[46ch] text-base text-brand-navy/75 md:text-[17px] dark:text-white/75">
            Tech news and what it means for recruiting, picked by the board.
          </p>
        </div>
      </HeroBand>

      <div className="mx-auto flex max-w-3xl flex-col gap-10 px-5 pb-16 pt-8 md:pt-10">
        {issue ? (
          <IssueView issue={issue} items={items} />
        ) : (
          <p className="text-zinc-600 dark:text-zinc-400">
            Nothing here yet. Check back soon.
          </p>
        )}

        {pastIssues.length > 0 && (
          <nav aria-labelledby="past-issues" className="flex flex-col gap-2">
            <h2 id="past-issues" className="text-lg font-semibold">
              Past issues
            </h2>
            <ul className="flex flex-col gap-1.5 text-[15px]">
              {pastIssues.map((past) => (
                <li key={past.id}>
                  <Link
                    href={`/newsletter?issue=${past.id}`}
                    className="text-brand-navy underline hover:text-brand-blue dark:text-brand-blue"
                  >
                    {past.title}
                  </Link>{" "}
                  <span className="text-zinc-600 dark:text-zinc-400">
                    &middot; {formatIssueDate(past.publishedOn)}
                  </span>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
      <SiteFooter />
    </main>
  );
}

