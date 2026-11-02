import Link from "next/link";
import { getAdminIssues } from "@/lib/newsletter-db";
import { MAX_CLOSING, MAX_INTRO, MAX_ISSUE_TITLE } from "@/lib/newsletter";
import { requireNewsletterAdmin } from "@/lib/require-admin";
import {
  removeIssueAction,
  saveIssueAction,
  setPublishedAction,
} from "./actions";
import {
  Badge,
  Notice,
  PageHeader,
  cardClass,
  dangerButtonClass,
  fieldLabelClass,
  inputClass,
  linkClass,
  primaryButtonClass,
  secondaryButtonClass,
  tableClass,
  tableWrapClass,
  tdClass,
  theadClass,
  thClass,
  trClass,
} from "../ui";

type Props = { searchParams: Promise<{ edit?: string; notice?: string }> };

const SECTION = "/admin/newsletter";

export default async function AdminNewsletterPage({ searchParams }: Props) {
  await requireNewsletterAdmin();

  const { edit, notice } = await searchParams;
  const issues = await getAdminIssues();
  const editing = edit
    ? issues.find((issue) => issue.id === Number(edit))
    : undefined;
  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "America/Los_Angeles",
  });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Newsletter"
        description="An issue is a titled, dated list of news items that you rank, with an optional intro above them and closing below. It stays a draft until you publish it; only published issues appear on the public Newsletter page."
      />
      <p className="text-sm">
        <Link href={`${SECTION}/tags`} className={linkClass}>
          Manage tags
        </Link>
      </p>

      {notice === "invalid-issue" && (
        <Notice message="Not saved: an issue needs a title and a date." />
      )}

      <section className={cardClass} aria-labelledby="issue-form">
        <h2 id="issue-form" className="font-semibold">
          {editing ? `Edit: ${editing.title}` : "New issue"}
        </h2>
        <form
          key={editing?.id ?? "new"}
          action={saveIssueAction}
          className="flex flex-col gap-3"
        >
          {editing && <input type="hidden" name="id" value={editing.id} />}
          <div className="flex flex-col gap-3 sm:flex-row">
            <label className={`${fieldLabelClass} sm:flex-[2]`}>
              Title
              <input
                name="title"
                required
                maxLength={MAX_ISSUE_TITLE}
                defaultValue={editing?.title}
                placeholder="e.g. Issue 3: Recruiting season"
                className={`${inputClass} font-normal`}
              />
            </label>
            <label className={`${fieldLabelClass} sm:flex-1`}>
              Date
              <input
                name="published_on"
                type="date"
                required
                defaultValue={editing?.publishedOn ?? today}
                className={`${inputClass} font-normal`}
              />
            </label>
          </div>
          <label className={fieldLabelClass}>
            Intro (optional, shown under the title, above the items)
            <textarea
              name="intro"
              rows={4}
              maxLength={MAX_INTRO}
              defaultValue={editing?.intro}
              className={`${inputClass} font-normal`}
            />
          </label>
          <label className={fieldLabelClass}>
            Closing (optional, shown below all the items)
            <textarea
              name="closing"
              rows={4}
              maxLength={MAX_CLOSING}
              defaultValue={editing?.closing}
              className={`${inputClass} font-normal`}
            />
          </label>
          <div className="flex items-center gap-3">
            <button type="submit" className={primaryButtonClass}>
              {editing ? "Save" : "Create and add items"}
            </button>
            {editing && (
              <Link href={SECTION} className={secondaryButtonClass}>
                Cancel
              </Link>
            )}
          </div>
        </form>
      </section>

      <div className={tableWrapClass}>
        <table className={`${tableClass} min-w-[40rem]`}>
          <thead className={theadClass}>
            <tr>
              <th scope="col" className={thClass}>Date</th>
              <th scope="col" className={thClass}>Issue</th>
              <th scope="col" className={thClass}>Items</th>
              <th scope="col" className={thClass}>Status</th>
              <th scope="col" className={thClass}>
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {issues.length === 0 ? (
              <tr className={trClass}>
                <td colSpan={5} className={`${tdClass} text-zinc-600`}>
                  No issues yet.
                </td>
              </tr>
            ) : (
              issues.map((issue) => (
                <tr key={issue.id} className={trClass}>
                  <td className={`${tdClass} whitespace-nowrap`}>
                    {issue.publishedOn}
                  </td>
                  <td className={`${tdClass} font-medium`}>
                    <Link
                      href={`${SECTION}/issues/${issue.id}`}
                      className={linkClass}
                    >
                      {issue.title}
                    </Link>
                  </td>
                  <td className={tdClass}>{issue.itemCount}</td>
                  <td className={tdClass}>
                    <Badge tone={issue.published ? "brand" : "neutral"}>
                      {issue.published ? "Published" : "Draft"}
                    </Badge>
                  </td>
                  <td className={tdClass}>
                    <div className="flex flex-wrap items-center gap-4">
                      <Link
                        href={`${SECTION}/issues/${issue.id}`}
                        className={`${linkClass} text-sm`}
                      >
                        Items
                      </Link>
                      <Link
                        href={`${SECTION}?edit=${issue.id}#issue-form`}
                        className={`${linkClass} text-sm`}
                      >
                        Edit
                      </Link>
                      <form action={setPublishedAction}>
                        <input type="hidden" name="id" value={issue.id} />
                        <input
                          type="hidden"
                          name="published"
                          value={issue.published ? "false" : "true"}
                        />
                        <button type="submit" className={`${linkClass} text-sm`}>
                          {issue.published ? "Unpublish" : "Publish"}
                        </button>
                      </form>
                      <form action={removeIssueAction}>
                        <input type="hidden" name="id" value={issue.id} />
                        <button type="submit" className={dangerButtonClass}>
                          Delete
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
