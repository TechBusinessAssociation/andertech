import Link from "next/link";
import { getTags } from "@/lib/newsletter-db";
import { MAX_TAG_LENGTH } from "@/lib/newsletter";
import { requireNewsletterAdmin } from "@/lib/require-admin";
import { addTagsAction, removeTagAction } from "../actions";
import {
  Notice,
  PageHeader,
  cardClass,
  dangerButtonClass,
  fieldLabelClass,
  inputClass,
  linkClass,
  primaryButtonClass,
  tableClass,
  tableWrapClass,
  tdClass,
  theadClass,
  thClass,
  trClass,
} from "../../ui";

type Props = { searchParams: Promise<{ notice?: string }> };

export default async function AdminNewsletterTagsPage({
  searchParams,
}: Props) {
  await requireNewsletterAdmin();

  const { notice } = await searchParams;
  const tags = await getTags();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Newsletter tags"
        description="Tags group news items by topic and are kept so items can be found by tag later. You can also create tags while writing an item. Deleting a tag removes it from every item that has it."
      />
      <p className="text-sm">
        <Link href="/admin/newsletter" className={linkClass}>
          &larr; Issues
        </Link>
      </p>

      {notice === "invalid" && (
        <Notice
          message={`Not saved: enter one or more tag names separated by commas, each up to ${MAX_TAG_LENGTH} characters.`}
        />
      )}

      <section className={cardClass} aria-labelledby="tag-form">
        <h2 id="tag-form" className="font-semibold">
          Add tags
        </h2>
        <form
          action={addTagsAction}
          className="flex flex-col gap-3 sm:flex-row sm:items-end"
        >
          <label className={`${fieldLabelClass} sm:flex-1`}>
            Names (comma-separated; ones that already exist are skipped)
            <input
              name="names"
              required
              placeholder="e.g. AI, Product, Recruiting"
              className={`${inputClass} font-normal`}
            />
          </label>
          <button type="submit" className={primaryButtonClass}>
            Add
          </button>
        </form>
      </section>

      <div className={tableWrapClass}>
        <table className={`${tableClass} min-w-[24rem]`}>
          <thead className={theadClass}>
            <tr>
              <th scope="col" className={thClass}>Tag</th>
              <th scope="col" className={thClass}>Used on</th>
              <th scope="col" className={thClass}>
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {tags.length === 0 ? (
              <tr className={trClass}>
                <td colSpan={3} className={`${tdClass} text-zinc-600`}>
                  No tags yet.
                </td>
              </tr>
            ) : (
              tags.map((tag) => (
                <tr key={tag.id} className={trClass}>
                  <td className={`${tdClass} font-medium`}>{tag.name}</td>
                  <td className={tdClass}>
                    {tag.itemCount} {tag.itemCount === 1 ? "item" : "items"}
                  </td>
                  <td className={tdClass}>
                    <form action={removeTagAction}>
                      <input type="hidden" name="id" value={tag.id} />
                      <button type="submit" className={dangerButtonClass}>
                        Delete
                      </button>
                    </form>
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
