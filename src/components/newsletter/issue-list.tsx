import Link from "next/link";
import { formatIssueDate } from "@/components/newsletter/issue-view";

// Every published issue, newest first, with the one being read marked. Used
// twice on /newsletter: in the "All issues" dropdown by the date, and in the
// "See all issues" list at the bottom. Plain links to ?issue=, no JavaScript.
export function IssueList({
  issues,
  currentId,
}: {
  issues: { id: number; title: string; publishedOn: string }[];
  currentId: number;
}) {
  return (
    <ol className="flex flex-col">
      {issues.map((issue) => {
        const current = issue.id === currentId;
        return (
          <li key={issue.id}>
            <Link
              href={`/newsletter?issue=${issue.id}`}
              aria-current={current ? "page" : undefined}
              className="block rounded-md px-2.5 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-900"
            >
              <span
                className={`block leading-snug ${
                  current
                    ? "font-semibold text-brand-navy dark:text-white"
                    : "font-medium text-zinc-800 dark:text-zinc-200"
                }`}
              >
                {issue.title}
              </span>
              <span className="text-[13px] text-zinc-500 dark:text-zinc-400">
                {formatIssueDate(issue.publishedOn)}
                {current && " · Reading now"}
              </span>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
