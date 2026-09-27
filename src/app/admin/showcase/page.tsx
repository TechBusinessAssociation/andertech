import Link from "next/link";
import { getShowcasePosts } from "@/lib/members-db";
import { requireAdmin } from "@/lib/require-admin";
import { removeShowcasePostAction, saveShowcasePostAction } from "./actions";
import {
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
  invalid: "Not saved: a post needs a title, and (if given) a link starting with http:// or https://.",
};

// AnderTech Showcase tab content: member projects/achievements, posted by
// the board. Naming a member is optional (see schema.sql's comment on the
// showcase_posts table) -- a post doesn't have to credit anyone.
export default async function AdminShowcasePage({ searchParams }: Props) {
  await requireAdmin();

  const { edit, notice } = await searchParams;
  const all = await getShowcasePosts(100);
  const editing = edit
    ? all.find((p) => Number(p.id) === Number(edit))
    : undefined;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="AnderTech Showcase"
        description="Member projects and achievements shown on the Showcase tab on /members, newest first. Naming a member is optional."
      />

      {notice && NOTICES[notice] && <Notice message={NOTICES[notice]} />}

      <section className={cardClass} aria-labelledby="showcase-form">
        <h2 id="showcase-form" className="font-semibold">
          {editing ? `Edit: ${editing.title}` : "Add post"}
        </h2>
        <form
          key={editing?.id ?? "new"}
          action={saveShowcasePostAction}
          className="flex flex-col gap-3"
        >
          {editing && <input type="hidden" name="id" value={editing.id} />}
          <label className={fieldLabelClass}>
            Title
            <input
              name="title"
              required
              defaultValue={editing?.title}
              placeholder="e.g. Landed a PM offer at Acme"
              className={`${inputClass} font-normal`}
            />
          </label>
          <label className={fieldLabelClass}>
            Member name (optional)
            <input
              name="memberName"
              defaultValue={editing?.member_name ?? ""}
              placeholder="Leave blank to post without a name"
              className={`${inputClass} font-normal`}
            />
          </label>
          <label className={fieldLabelClass}>
            Description (optional)
            <textarea
              name="description"
              rows={3}
              defaultValue={editing?.description ?? ""}
              className={`${inputClass} font-normal`}
            />
          </label>
          <label className={fieldLabelClass}>
            Link (optional)
            <input
              name="url"
              type="url"
              defaultValue={editing?.url ?? ""}
              placeholder="https://..."
              className={`${inputClass} font-normal`}
            />
          </label>
          <div className="flex items-center gap-3">
            <button type="submit" className={primaryButtonClass}>
              {editing ? "Save changes" : "Add post"}
            </button>
            {editing && (
              <Link href="/admin/showcase" className={secondaryButtonClass}>
                Cancel
              </Link>
            )}
          </div>
        </form>
      </section>

      <div className={tableWrapClass}>
        <table className={tableClass}>
          <thead className={theadClass}>
            <tr>
              <th scope="col" className={thClass}>
                Date
              </th>
              <th scope="col" className={thClass}>
                Title
              </th>
              <th scope="col" className={thClass}>
                Member
              </th>
              <th scope="col" className={thClass}>
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {all.length === 0 ? (
              <tr className={trClass}>
                <td colSpan={4} className={`${tdClass} text-zinc-600`}>
                  No posts yet. Add one above.
                </td>
              </tr>
            ) : (
              all.map((p) => (
                <tr key={p.id} className={trClass}>
                  <td className={`${tdClass} whitespace-nowrap`}>
                    {p.created_at}
                  </td>
                  <td className={`${tdClass} font-medium`}>
                    {p.url ? (
                      <a
                        href={p.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={linkClass}
                      >
                        {p.title}
                      </a>
                    ) : (
                      p.title
                    )}
                  </td>
                  <td className={tdClass}>{p.member_name ?? ""}</td>
                  <td className={tdClass}>
                    <div className="flex items-center gap-4">
                      <Link
                        href={`/admin/showcase?edit=${p.id}#showcase-form`}
                        className={`${linkClass} text-sm`}
                      >
                        Edit
                      </Link>
                      <form action={removeShowcasePostAction}>
                        <input type="hidden" name="id" value={p.id} />
                        <input type="hidden" name="back" value="/admin/showcase" />
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
