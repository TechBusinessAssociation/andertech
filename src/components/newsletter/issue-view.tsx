import Image from "next/image";
import Link from "next/link";
import { RichText } from "@/components/rich-text";
import type { NewsletterItem } from "@/lib/newsletter-db";

// One issue as readers see it: title and date, intro, the ranked items, then
// the closing. Shared by the public /newsletter page and the admin preview, so
// what an editor previews is what gets published. It only draws what it is
// given: the caller decides whether Editor's takes were fetched at all (see
// getIssueItems), and an item with a take that wasn't fetched shows the
// "sign in to read" lock instead.
export function formatIssueDate(ymd: string): string {
  return new Date(`${ymd}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function IssueView({
  issue,
  items,
}: {
  issue: { title: string; publishedOn: string; intro: string; closing: string };
  items: NewsletterItem[];
}) {
  return (
    <>
      <header className="flex flex-col gap-1 border-b border-zinc-200 pb-6 dark:border-zinc-800">
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-zinc-600 dark:text-zinc-400">
          {formatIssueDate(issue.publishedOn)}
        </p>
        <h2 className="text-3xl font-semibold tracking-tight text-balance">
          {issue.title}
        </h2>
        <RichText
          text={issue.intro}
          className="mt-3 text-[17px] leading-relaxed"
        />
      </header>

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
            {item.tags.length > 0 && (
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
            )}
          </div>
          <RichText text={item.body} className="text-[17px] leading-relaxed" />

          {item.hasTake &&
            (item.editorsTake !== null ? (
              <aside className="rounded-xl border border-brand-blue/40 bg-brand-sky/40 p-4 dark:border-brand-blue/50 dark:bg-brand-navy/40">
                <h4 className="text-sm font-semibold uppercase tracking-wide text-brand-navy dark:text-white">
                  Editor&apos;s take
                </h4>
                <RichText text={item.editorsTake} className="mt-2 leading-relaxed" />
              </aside>
            ) : (
              <aside className="rounded-xl border border-dashed border-zinc-300 p-4 text-sm text-zinc-700 dark:border-zinc-700 dark:text-zinc-300">
                <span className="font-semibold">Editor&apos;s take</span> is for
                members.{" "}
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

      {issue.closing.trim() && (
        <RichText
          text={issue.closing}
          className="border-t border-zinc-200 pt-8 text-[17px] leading-relaxed dark:border-zinc-800"
        />
      )}
    </>
  );
}
