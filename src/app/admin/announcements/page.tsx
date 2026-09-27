import Link from "next/link";
import { getAnnouncements } from "@/lib/members-db";
import { requireAdmin } from "@/lib/require-admin";
import {
  removeAnnouncementAction,
  saveAnnouncementAction,
} from "./actions";
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
  invalid: "Not saved: an announcement needs a title, and (if given) a link starting with http:// or https://.",
};

// What's new tab content: a short manual announcement feed, newest first
// (see schema.sql's comment on the announcements table).
export default async function AdminAnnouncementsPage({ searchParams }: Props) {
  await requireAdmin();

  const { edit, notice } = await searchParams;
  const all = await getAnnouncements(100);
  const editing = edit
    ? all.find((a) => Number(a.id) === Number(edit))
    : undefined;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="What's new"
        description="A short announcement feed shown on the What's new tab on /members, newest first."
      />

      {notice && NOTICES[notice] && <Notice message={NOTICES[notice]} />}

      <section className={cardClass} aria-labelledby="announcement-form">
        <h2 id="announcement-form" className="font-semibold">
          {editing ? `Edit: ${editing.title}` : "Add announcement"}
        </h2>
        <form
          key={editing?.id ?? "new"}
          action={saveAnnouncementAction}
          className="flex flex-col gap-3"
        >
          {editing && <input type="hidden" name="id" value={editing.id} />}
          <label className={fieldLabelClass}>
            Title
            <input
              name="title"
              required
              defaultValue={editing?.title}
              className={`${inputClass} font-normal`}
            />
          </label>
          <label className={fieldLabelClass}>
            Body (optional)
            <textarea
              name="body"
              rows={3}
              defaultValue={editing?.body ?? ""}
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
              {editing ? "Save changes" : "Add announcement"}
            </button>
            {editing && (
              <Link href="/admin/announcements" className={secondaryButtonClass}>
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
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {all.length === 0 ? (
              <tr className={trClass}>
                <td colSpan={3} className={`${tdClass} text-zinc-600`}>
                  No announcements yet. Add one above.
                </td>
              </tr>
            ) : (
              all.map((a) => (
                <tr key={a.id} className={trClass}>
                  <td className={`${tdClass} whitespace-nowrap`}>
                    {a.created_at}
                  </td>
                  <td className={`${tdClass} font-medium`}>
                    {a.url ? (
                      <a
                        href={a.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={linkClass}
                      >
                        {a.title}
                      </a>
                    ) : (
                      a.title
                    )}
                  </td>
                  <td className={tdClass}>
                    <div className="flex items-center gap-4">
                      <Link
                        href={`/admin/announcements?edit=${a.id}#announcement-form`}
                        className={`${linkClass} text-sm`}
                      >
                        Edit
                      </Link>
                      <form action={removeAnnouncementAction}>
                        <input type="hidden" name="id" value={a.id} />
                        <input type="hidden" name="back" value="/admin/announcements" />
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
