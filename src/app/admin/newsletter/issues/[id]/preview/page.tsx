import Link from "next/link";
import { notFound } from "next/navigation";
import { IssueView } from "@/components/newsletter/issue-view";
import { getAdminIssue, getIssueItems } from "@/lib/newsletter-db";
import { requireNewsletterAdmin } from "@/lib/require-admin";
import { Badge, linkClass } from "../../../../ui";

type Props = { params: Promise<{ id: string }> };

// Shows an issue exactly as readers will see it, drafts included, with the
// members-only Editor's takes visible (editors can always read them). Uses the
// same <IssueView> as /newsletter, so the two can't drift apart.
export default async function AdminIssuePreviewPage({ params }: Props) {
  await requireNewsletterAdmin();

  const issueId = Number((await params).id);
  const issue = Number.isInteger(issueId) ? await getAdminIssue(issueId) : null;
  if (!issue) notFound();

  const items = await getIssueItems(issue.id, true, true);

  return (
    <div className="flex flex-col gap-6">
      <div
        role="status"
        className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-100"
      >
        <span className="font-semibold">Preview</span>
        <Badge tone={issue.published ? "brand" : "neutral"}>
          {issue.published ? "Published" : "Draft: not public yet"}
        </Badge>
        <span>
          Editor&apos;s takes are shown here; signed-out visitors see a lock
          instead.
        </span>
        <Link
          href={`/admin/newsletter/issues/${issue.id}`}
          className={`${linkClass} ml-auto`}
        >
          &larr; Back to editing
        </Link>
      </div>

      <div className="mx-auto flex w-full max-w-3xl flex-col gap-10">
        <IssueView issue={issue} items={items} />
      </div>
    </div>
  );
}
