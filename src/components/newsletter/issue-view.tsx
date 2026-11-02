import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { RichText } from "@/components/rich-text";
import type { NewsletterItem } from "@/lib/newsletter-db";

// One issue as readers see it: date, title and intro, the ranked items, then
// the closing. Shared by the public /newsletter page and the admin preview, so
// what an editor previews is what gets published. It only draws what it is
// given: the caller decides whether Editor's takes were fetched at all (see
// getIssueItems), and an item with a take that wasn't fetched shows a one-line
// "sign in to read" note instead.
//
// The look is deliberately plain, like a Medium or Substack post: one reading
// column (the caller sets its 680px width), body text at 19px, no boxes. The
// display face is used only for the issue title; gold appears only as the
// Editor's take rule. `meta` is an optional slot beside the date (the public
// page puts the "All issues" menu there).
export function formatIssueDate(ymd: string): string {
  return new Date(`${ymd}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

const bodyText = "text-[19px] leading-[1.75]";
const muted = "text-zinc-500 dark:text-zinc-400";

export function IssueView({
  issue,
  items,
  meta,
}: {
  issue: { title: string; publishedOn: string; intro: string; closing: string };
  items: NewsletterItem[];
  meta?: ReactNode;
}) {
  return (
    <div className="text-zinc-800 dark:text-zinc-300">
      <header>
        <div className={`flex flex-wrap items-center gap-x-3.5 gap-y-1 text-sm ${muted}`}>
          <span>{formatIssueDate(issue.publishedOn)}</span>
          {meta}
        </div>
        <h2 className="mt-3 font-display text-[2rem] font-bold leading-[1.1] tracking-[-0.035em] text-balance text-brand-navy md:text-[2.6rem] dark:text-white">
          {issue.title}
        </h2>
        <RichText
          text={issue.intro}
          className={`mt-3.5 text-xl leading-normal ${muted}`}
        />
      </header>

      {items.map((item, index) => (
        <article key={item.id} className="pt-12">
          {/* A short centered rule between stories, not before the first. */}
          {index > 0 && (
            <hr className="mx-auto mb-12 w-12 border-zinc-200 dark:border-zinc-800" />
          )}
          {/* Rank and tags on one quiet line, e.g. "1 · Recruiting, Big tech". */}
          <p className={`mb-1.5 text-sm ${muted}`}>
            <span className="sr-only">Story </span>
            {index + 1}
            {item.tags.length > 0 && (
              <>
                {" "}&middot; <span className="sr-only">Tags: </span>
                {item.tags.join(", ")}
              </>
            )}
          </p>
          <h3 className="mb-[18px] text-2xl font-semibold leading-snug tracking-[-0.015em] text-balance text-brand-navy dark:text-white">
            {item.title}
          </h3>
          {item.imageUrl && (
            <Image
              src={item.imageUrl}
              alt={item.imageAlt}
              width={1600}
              height={900}
              sizes="(min-width: 712px) 680px, 100vw"
              className="mb-[26px] h-auto w-full rounded"
            />
          )}
          <RichText text={item.body} className={bodyText} />

          {item.hasTake &&
            (item.editorsTake !== null ? (
              <aside
                aria-label="Editor's take"
                className="mt-6 border-l-[3px] border-brand-gold py-0.5 pl-[18px] text-lg leading-[1.7]"
              >
                <p className="font-semibold text-brand-navy dark:text-white">
                  Editor&apos;s take
                </p>
                <RichText text={item.editorsTake} />
              </aside>
            ) : (
              <p className={`mt-6 border-l-[3px] border-brand-gold pl-3 ${muted}`}>
                The Editor&apos;s take is for members.{" "}
                <Link
                  href="/sign-in"
                  data-umami-event="sign-in-click"
                  data-umami-event-from="newsletter"
                  className="text-brand-navy underline underline-offset-[3px] hover:text-brand-blue dark:text-[#9cc6ea]"
                >
                  Sign in
                </Link>{" "}
                to read it.
              </p>
            ))}
        </article>
      ))}

      {issue.closing.trim() && (
        <RichText
          text={issue.closing}
          className={`mt-14 border-t border-zinc-200 pt-7 dark:border-zinc-800 ${bodyText}`}
        />
      )}
    </div>
  );
}
