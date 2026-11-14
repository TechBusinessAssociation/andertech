import Link from "next/link";
import { getAdminResources, getCategories } from "@/lib/members-db";
import {
  HIGHLIGHT_NOTE_MAX,
  HIGHLIGHT_RANKS,
  MAX_HIGHLIGHTS,
} from "@/lib/highlights";
import { requireResourceEditor } from "@/lib/require-admin";
import { SECTION_LABELS } from "@/lib/tab-sections";
import { removeResourceAction, saveResourceAction } from "./actions";
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

type Props = {
  searchParams: Promise<{ edit?: string; notice?: string }>;
};

const NOTICES: Record<string, string> = {
  invalid:
    "Not saved: a resource needs a label, a category, and a link starting with http:// or https://.",
  "not-allowed":
    "Not saved: you can only edit resources in the Recruiting resources tab.",
  "highlight-invalid": `Not saved: a highlight needs a position and a reason (up to ${HIGHLIGHT_NOTE_MAX} characters).`,
  "highlight-full": `Not saved: that tab already has ${MAX_HIGHLIGHTS} highlights. Remove one first (edit it and untick "Highlight").`,
  "highlight-taken":
    "Not saved: another highlight on that tab already has this position. Pick a free one, or move the other one first.",
};

function EyeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export default async function AdminResourcesPage({ searchParams }: Props) {
  // Admins see every tab; recruiting editors only Recruiting resources.
  const { sections } = await requireResourceEditor();

  const { edit, notice } = await searchParams;
  const [resources, allCategories] = await Promise.all([
    getAdminResources(sections),
    getCategories(),
  ]);
  const categories = allCategories.filter((c) => sections.includes(c.section));
  // Current highlights per tab, shown next to the highlight fields so the
  // editor can see which positions are free.
  const highlightsBySection = sections
    .map((section) => ({
      section,
      items: resources
        .filter((r) => r.section === section && r.highlight_rank !== null)
        .sort((a, b) => Number(a.highlight_rank) - Number(b.highlight_rank)),
    }))
    .filter((group) => group.items.length > 0);
  // Postgres returns bigserial ids as strings, hence Number().
  const editing = edit
    ? resources.find((resource) => Number(resource.id) === Number(edit))
    : undefined;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Resources"
        description="Links members see on the members page. The files themselves stay in Drive; set each file to restricted sharing there."
      />

      {notice && NOTICES[notice] && <Notice message={NOTICES[notice]} />}

      <section className={cardClass} aria-labelledby="resource-form">
        <h2 id="resource-form" className="font-semibold">
          {editing ? `Edit: ${editing.label}` : "Add resource"}
        </h2>

        {categories.length === 0 ? (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Add a{" "}
            <Link href="/admin/categories" className={linkClass}>
              category
            </Link>{" "}
            first; every resource belongs to one.
          </p>
        ) : (
          <form
            key={editing?.id ?? "new"}
            action={saveResourceAction}
            className="flex flex-col gap-3"
          >
            {editing && <input type="hidden" name="id" value={editing.id} />}
            <div className="flex flex-col gap-3 sm:flex-row">
              <label className={`${fieldLabelClass} sm:flex-1`}>
                Label
                <input
                  name="label"
                  required
                  defaultValue={editing?.label}
                  placeholder="Summer Guide"
                  className={`${inputClass} font-normal`}
                />
              </label>
              <label className={`${fieldLabelClass} sm:flex-1`}>
                Link
                <input
                  name="url"
                  type="url"
                  required
                  defaultValue={editing?.url}
                  placeholder="https://..."
                  className={`${inputClass} font-normal`}
                />
              </label>
            </div>
            <label className={fieldLabelClass}>
              Description (optional)
              <input
                name="description"
                defaultValue={editing?.description ?? ""}
                className={`${inputClass} font-normal`}
              />
            </label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <label className={`${fieldLabelClass} sm:flex-1`}>
                Category
                <select
                  name="category_id"
                  required
                  defaultValue={editing?.category_id ?? ""}
                  className={`${inputClass} font-normal`}
                >
                  <option value="" disabled>
                    Choose a category
                  </option>
                  {sections.map((section) => {
                    const inSection = categories.filter(
                      (c) => c.section === section,
                    );
                    if (inSection.length === 0) return null;
                    return (
                      <optgroup key={section} label={SECTION_LABELS[section]}>
                        {inSection.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </optgroup>
                    );
                  })}
                </select>
              </label>
              <label className={`${fieldLabelClass} sm:w-40`}>
                Order in category
                <input
                  name="sort_order"
                  type="number"
                  defaultValue={editing?.sort_order ?? 0}
                  className={`${inputClass} font-normal`}
                />
              </label>
            </div>
            <fieldset className="flex flex-col gap-3 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
              <legend className="px-1 text-sm font-semibold">Highlight</legend>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="highlight"
                  defaultChecked={editing?.highlight_rank != null}
                />
                Highlight at the top of its tab (up to {MAX_HIGHLIGHTS} per
                tab)
              </label>
              <div className="flex flex-col gap-3 sm:flex-row">
                <label className={`${fieldLabelClass} sm:flex-1`}>
                  Why we&apos;re highlighting it
                  <textarea
                    name="highlight_note"
                    rows={2}
                    maxLength={HIGHLIGHT_NOTE_MAX}
                    defaultValue={editing?.highlight_note ?? ""}
                    placeholder="The best one-page guide to PM interview loops we've found."
                    className={`${inputClass} font-normal`}
                  />
                </label>
                <label className={`${fieldLabelClass} sm:w-40`}>
                  Position
                  <select
                    name="highlight_rank"
                    defaultValue={editing?.highlight_rank ?? 1}
                    className={`${inputClass} font-normal`}
                  >
                    {HIGHLIGHT_RANKS.map((rank) => (
                      <option key={rank} value={rank}>
                        {rank}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                Shown as a card above that tab&apos;s dashboard and categories;
                the resource also stays in its category. Required when
                highlighted, up to {HIGHLIGHT_NOTE_MAX} characters.
              </p>
              {highlightsBySection.length > 0 && (
                <ul className="text-xs text-zinc-600 dark:text-zinc-400">
                  {highlightsBySection.map(({ section, items }) => (
                    <li key={section}>
                      <span className="font-semibold">
                        {SECTION_LABELS[section]}:
                      </span>{" "}
                      {items
                        .map((r) => `${r.highlight_rank}. ${r.label}`)
                        .join(", ")}
                    </li>
                  ))}
                </ul>
              )}
            </fieldset>
            <div className="flex items-center gap-3">
              <button type="submit" className={primaryButtonClass}>
                {editing ? "Save changes" : "Add resource"}
              </button>
              {editing && (
                <Link href="/admin/resources" className={secondaryButtonClass}>
                  Cancel
                </Link>
              )}
            </div>
          </form>
        )}
      </section>

      <div className={tableWrapClass}>
        <table className={`${tableClass} min-w-[44rem]`}>
          <thead className={theadClass}>
            <tr>
              <th scope="col" className={thClass}>
                Resource
              </th>
              <th scope="col" className={thClass}>
                Category
              </th>
              <th scope="col" className={thClass}>
                Description
              </th>
              <th scope="col" className={thClass}>
                Order
              </th>
              <th scope="col" className={thClass}>
                Link
              </th>
              <th scope="col" className={thClass}>
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {resources.length === 0 ? (
              <tr className={trClass}>
                <td colSpan={6} className={`${tdClass} text-zinc-600`}>
                  No resources yet.
                </td>
              </tr>
            ) : (
              resources.map((resource) => (
                <tr key={resource.id} className={trClass}>
                  <td className={tdClass}>
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${linkClass} font-medium`}
                    >
                      {resource.label}
                    </a>
                    {resource.highlight_rank != null && (
                      <span className="ml-2 align-middle">
                        <Badge tone="brand">
                          Highlight {resource.highlight_rank}
                        </Badge>
                      </span>
                    )}
                  </td>
                  <td className={tdClass}>{resource.category_name ?? "Other"}</td>
                  <td className={`${tdClass} text-zinc-600 dark:text-zinc-400`}>
                    {resource.description ?? ""}
                  </td>
                  <td className={tdClass}>{resource.sort_order}</td>
                  <td className={tdClass}>
                    <details>
                      <summary
                        aria-label={`Show link for ${resource.label}`}
                        title="Show link"
                        className="inline-flex cursor-pointer list-none text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 [&::-webkit-details-marker]:hidden"
                      >
                        <EyeIcon />
                      </summary>
                      <p className="mt-2 max-w-64 break-all font-mono text-xs">
                        {resource.url}
                      </p>
                    </details>
                  </td>
                  <td className={tdClass}>
                    <div className="flex items-center gap-4">
                      <Link
                        href={`/admin/resources?edit=${resource.id}#resource-form`}
                        className={`${linkClass} text-sm`}
                      >
                        Edit
                      </Link>
                      <form action={removeResourceAction}>
                        <input type="hidden" name="id" value={resource.id} />
                        <button type="submit" className={dangerButtonClass}>
                          Remove
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
