import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getAdminIssue,
  getAdminItems,
  getNewsletterAuthors,
  getTags,
} from "@/lib/newsletter-db";
import {
  MAX_ALT,
  MAX_BODY,
  MAX_TAG_LENGTH,
  MAX_TAGS_PER_ITEM,
  MAX_TAKE,
  MAX_TITLE,
} from "@/lib/newsletter";
import { requireNewsletterAdmin } from "@/lib/require-admin";
import {
  moveItemAction,
  removeItemAction,
  saveItemAction,
  setPublishedAction,
} from "../../actions";
import { ImageField } from "../../image-field";
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
} from "../../../ui";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ edit?: string; notice?: string }>;
};

const NOTICES: Record<string, string> = {
  "invalid-item": `Not saved: an item needs a title and a body, and at most ${MAX_TAGS_PER_ITEM} tags (each new tag up to ${MAX_TAG_LENGTH} characters).`,
  image: "Not saved: the image must be a JPG, PNG or WebP under 2 MB.",
  alt: "Not saved: add a short description of the image (alt text) so it works with screen readers.",
};

const smallButton =
  "rounded border border-zinc-300 px-2 py-1 text-xs hover:bg-zinc-50 disabled:opacity-40 dark:border-zinc-700 dark:hover:bg-zinc-900";

export default async function AdminIssuePage({ params, searchParams }: Props) {
  await requireNewsletterAdmin();

  const issueId = Number((await params).id);
  const { edit, notice } = await searchParams;
  const issue = Number.isInteger(issueId) ? await getAdminIssue(issueId) : null;
  if (!issue) notFound();

  const [items, tags, authors] = await Promise.all([
    getAdminItems(issue.id),
    getTags(),
    getNewsletterAuthors(),
  ]);
  const editing = edit
    ? items.find((item) => item.id === Number(edit))
    : undefined;
  const here = `/admin/newsletter/issues/${issue.id}`;
  const tagName = new Map(tags.map((tag) => [tag.id, tag.name]));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={issue.title}
        description={`${issue.publishedOn}. Items show in the order below: use Move up / Move down to rank them (the top one is shown first).`}
      />
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <Link href="/admin/newsletter" className={linkClass}>
          &larr; Issues
        </Link>
        <Badge tone={issue.published ? "brand" : "neutral"}>
          {issue.published ? "Published" : "Draft"}
        </Badge>
        <form action={setPublishedAction}>
          <input type="hidden" name="id" value={issue.id} />
          <input
            type="hidden"
            name="published"
            value={issue.published ? "false" : "true"}
          />
          <input type="hidden" name="back" value={here} />
          <button type="submit" className={linkClass}>
            {issue.published ? "Unpublish" : "Publish"}
          </button>
        </form>
        {issue.published && (
          <Link href="/newsletter" className={linkClass}>
            View public page
          </Link>
        )}
      </div>

      {notice && NOTICES[notice] && <Notice message={NOTICES[notice]} />}

      <ol className="flex flex-col gap-3" aria-label="Items in this issue">
        {items.length === 0 && (
          <li className="text-sm text-zinc-600 dark:text-zinc-400">
            No items yet. Add the first one below.
          </li>
        )}
        {items.map((item, index) => (
          <li
            key={item.id}
            className="flex flex-col gap-2 rounded-lg border border-zinc-200 p-3 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800"
          >
            <div className="flex min-w-0 flex-col gap-1">
              <p className="font-medium">
                <span className="mr-2 text-zinc-500">{index + 1}.</span>
                {item.title}
              </p>
              <div className="flex flex-wrap gap-1">
                {item.tagIds.map((id) => (
                  <Badge key={id}>{tagName.get(id) ?? "?"}</Badge>
                ))}
                {item.editorsTake && <Badge tone="brand">Editor&apos;s take</Badge>}
              </div>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-3">
              {(["up", "down"] as const).map((direction) => (
                <form key={direction} action={moveItemAction}>
                  <input type="hidden" name="issue_id" value={issue.id} />
                  <input type="hidden" name="id" value={item.id} />
                  <input type="hidden" name="direction" value={direction} />
                  <button
                    type="submit"
                    className={smallButton}
                    disabled={
                      direction === "up"
                        ? index === 0
                        : index === items.length - 1
                    }
                    aria-label={`Move "${item.title}" ${direction}`}
                  >
                    {direction === "up" ? "Move up" : "Move down"}
                  </button>
                </form>
              ))}
              <Link
                href={`${here}?edit=${item.id}#item-form`}
                className={`${linkClass} text-sm`}
              >
                Edit
              </Link>
              <form action={removeItemAction}>
                <input type="hidden" name="issue_id" value={issue.id} />
                <input type="hidden" name="id" value={item.id} />
                <button type="submit" className={dangerButtonClass}>
                  Remove
                </button>
              </form>
            </div>
          </li>
        ))}
      </ol>

      <section className={cardClass} aria-labelledby="item-form">
        <h2 id="item-form" className="font-semibold">
          {editing ? `Edit: ${editing.title}` : "Add news item"}
        </h2>
        <form
          key={editing?.id ?? "new"}
          action={saveItemAction}
          className="flex flex-col gap-3"
        >
          <input type="hidden" name="issue_id" value={issue.id} />
          {editing && <input type="hidden" name="id" value={editing.id} />}
          <label className={fieldLabelClass}>
            Title
            <input
              name="title"
              required
              maxLength={MAX_TITLE}
              defaultValue={editing?.title}
              className={`${inputClass} font-normal`}
            />
          </label>
          <label className={fieldLabelClass}>
            Body (public)
            <textarea
              name="body"
              required
              rows={6}
              maxLength={MAX_BODY}
              defaultValue={editing?.body}
              className={`${inputClass} font-normal`}
            />
          </label>
          <label className={fieldLabelClass}>
            Editor&apos;s take (members only, optional)
            <textarea
              name="editors_take"
              rows={4}
              maxLength={MAX_TAKE}
              defaultValue={editing?.editorsTake}
              className={`${inputClass} font-normal`}
            />
          </label>

          <fieldset className="flex flex-col gap-2">
            <legend className="text-sm font-medium">
              Tags (up to {MAX_TAGS_PER_ITEM})
            </legend>
            {tags.length > 0 ? (
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                {tags.map((tag) => (
                  <label key={tag.id} className="flex items-center gap-1.5">
                    <input
                      type="checkbox"
                      name="tag_ids"
                      value={tag.id}
                      defaultChecked={editing?.tagIds.includes(tag.id)}
                    />
                    {tag.name}
                  </label>
                ))}
              </div>
            ) : (
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                No tags exist yet. Create some below.
              </p>
            )}
            <label className={fieldLabelClass}>
              New tags (comma-separated, created when you save)
              <input
                name="new_tags"
                placeholder="e.g. Funding, Layoffs"
                className={`${inputClass} font-normal`}
              />
            </label>
          </fieldset>

          <label className={fieldLabelClass}>
            Author (optional, not shown on the site)
            <input
              name="author_name"
              list="newsletter-authors"
              defaultValue={editing?.authorName}
              className={`${inputClass} font-normal`}
            />
            <datalist id="newsletter-authors">
              {authors.map((name) => (
                <option key={name} value={name} />
              ))}
            </datalist>
          </label>
          <ImageField inputClass={inputClass} labelClass={fieldLabelClass} />
          {editing?.imageUrl && (
            <div className="flex items-center gap-3 text-sm">
              {/* eslint-disable-next-line @next/next/no-img-element -- small admin preview */}
              <img
                src={editing.imageUrl}
                alt={editing.imageAlt}
                className="h-16 w-auto rounded"
              />
              <label className="flex items-center gap-2">
                <input type="checkbox" name="remove_image" />
                Remove this image
              </label>
            </div>
          )}
          <label className={fieldLabelClass}>
            Image description (alt text; required if there is an image)
            <input
              name="image_alt"
              maxLength={MAX_ALT}
              defaultValue={editing?.imageAlt}
              className={`${inputClass} font-normal`}
            />
          </label>
          <div className="flex items-center gap-3">
            <button type="submit" className={primaryButtonClass}>
              {editing ? "Save changes" : "Add news item"}
            </button>
            {editing && (
              <Link href={here} className={secondaryButtonClass}>
                Cancel
              </Link>
            )}
          </div>
        </form>
      </section>
    </div>
  );
}
