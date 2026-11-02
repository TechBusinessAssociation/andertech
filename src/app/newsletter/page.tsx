import Image from "next/image";
import Link from "next/link";
import { auth } from "@/auth";
import { Analytics } from "@/components/analytics";
import { HeroBand } from "@/components/hero-band";
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
          <header className="flex flex-col gap-1 border-b border-zinc-200 pb-6 dark:border-zinc-800">
            <p className="font-mono text-xs uppercase tracking-[0.14em] text-zinc-600 dark:text-zinc-400">
              {formatDate(issue.publishedOn)}
            </p>
            <h2 className="text-3xl font-semibold tracking-tight text-balance">
              {issue.title}
            </h2>
            {issue.intro && (
              <p className="mt-3 whitespace-pre-line text-[17px] leading-relaxed">
                {issue.intro}
              </p>
            )}
          </header>
        ) : (
          <p className="text-zinc-600 dark:text-zinc-400">
            Nothing here yet. Check back soon.
          </p>
        )}
        {items.map((item) => (
          <article
            key={item.id}
            className="flex flex-col gap-4 border-b border-zinc-200 pb-10 last:border-b-0 dark:border-zinc-800"
          >
            {item.imageUrl && (
              <Image
                src={item.imageUrl}
                alt={item.imageAlt}
                width={1600}
                height={900}
                sizes="(min-width: 768px) 48rem, 100vw"
                className="h-auto w-full rounded-xl"
              />
            )}
            <div className="flex flex-col gap-2">
              <h3 className="text-2xl font-semibold tracking-tight text-balance">
                {item.title}
              </h3>
              <ul className="flex flex-wrap gap-1.5" aria-label="Tags">
                {item.tags.map((tag) => (
                  <li
                    key={tag}
                    className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100"
                  >
                    {tag}
                  </li>
                ))}
              </ul>
            </div>
            {/* Plain text; whitespace-pre-line keeps the editor's paragraphs. */}
            <p className="whitespace-pre-line text-[17px] leading-relaxed">
              {item.body}
            </p>

            {item.hasTake &&
              (item.editorsTake !== null ? (
                <aside className="rounded-xl border border-brand-blue/40 bg-brand-sky/40 p-4 dark:border-brand-blue/50 dark:bg-brand-navy/40">
                  <h4 className="text-sm font-semibold uppercase tracking-wide text-brand-navy dark:text-white">
                    Editor&apos;s take
                  </h4>
                  <p className="mt-2 whitespace-pre-line leading-relaxed">
                    {item.editorsTake}
                  </p>
                </aside>
              ) : (
                <aside className="rounded-xl border border-dashed border-zinc-300 p-4 text-sm text-zinc-700 dark:border-zinc-700 dark:text-zinc-300">
                  <span className="font-semibold">Editor&apos;s take</span> is
                  for members.{" "}
                  <Link
                    href="/sign-in"
                    data-umami-event="sign-in-click"
                    data-umami-event-from="newsletter"
                    className="text-brand-navy underline hover:text-brand-blue dark:text-brand-blue"
                  >
                    Sign in
                  </Link>{" "}
                  to read it.
                </aside>
              ))}
          </article>
        ))}

        {issue?.closing && (
          <p className="whitespace-pre-line border-t border-zinc-200 pt-8 text-[17px] leading-relaxed dark:border-zinc-800">
            {issue.closing}
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
                    &middot; {formatDate(past.publishedOn)}
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

function formatDate(ymd: string): string {
  return new Date(`${ymd}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}
