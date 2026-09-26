import Link from "next/link";
import { isEnvAdminEmail } from "@/lib/admin";
import {
  countMembers,
  listMembers,
  MEMBERS_PAGE_SIZE,
} from "@/lib/members-db";
import { requireAdmin } from "@/lib/require-admin";
import { DEFAULT_ROLE, ROLES, ROLE_LABELS, type Role } from "@/lib/roles";
import { addMembersAction, removeMemberAction, setRolesAction } from "./actions";
import {
  Badge,
  Notice,
  PageHeader,
  cardClass,
  dangerButtonClass,
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
  searchParams: Promise<{
    q?: string;
    page?: string;
    notice?: string;
    count?: string;
  }>;
};

function membersHref(query: string, page: number): string {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return `/admin/members${qs ? `?${qs}` : ""}`;
}

function noticeMessage(notice: string | undefined, count: string | undefined) {
  switch (notice) {
    case "added": {
      const n = Number(count) || 0;
      return `Added ${n} member${n === 1 ? "" : "s"}.`;
    }
    case "no-emails":
      return "No valid emails found. Paste one or more addresses.";
    case "cannot-remove-self":
      return "You can't remove yourself. Ask another admin.";
    case "cannot-demote-self":
      return "You can't take the admin role away from yourself. Ask another admin.";
    default:
      return null;
  }
}

export default async function AdminMembersPage({ searchParams }: Props) {
  await requireAdmin();

  const { q, page, notice, count } = await searchParams;
  const query = q?.trim() ?? "";

  const [list, overall] = await Promise.all([
    listMembers(query, Number(page) || 1),
    countMembers(),
  ]);
  const message = noticeMessage(notice, count);
  const back = membersHref(query, list.page);

  const first = list.total === 0 ? 0 : (list.page - 1) * MEMBERS_PAGE_SIZE + 1;
  const last = Math.min(list.page * MEMBERS_PAGE_SIZE, list.total);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={`Members (${overall.toLocaleString()})`}
        description="Who can sign in to the members area, and what role each person has."
      />

      {message && <Notice message={message} />}

      <section className={cardClass} aria-labelledby="add-members">
        <h2 id="add-members" className="font-semibold">
          Add members
        </h2>
        <form action={addMembersAction} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm font-medium">
            Emails (one per line, or comma-separated)
            <textarea
              name="emails"
              rows={4}
              required
              className={`${inputClass} font-normal`}
              placeholder="jane.doe@anderson.ucla.edu"
            />
          </label>
          <fieldset className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <legend className="mb-1 text-sm font-medium">Roles</legend>
            {ROLES.map((role) => (
              <label key={role} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="roles"
                  value={role}
                  defaultChecked={role === DEFAULT_ROLE}
                />
                {ROLE_LABELS[role]}
              </label>
            ))}
          </fieldset>
          <button type="submit" className={primaryButtonClass}>
            Add
          </button>
        </form>
      </section>

      <section className="flex flex-col gap-3" aria-labelledby="member-list">
        <h2 id="member-list" className="font-semibold">
          All members
        </h2>

        <form action="/admin/members" className="flex flex-wrap gap-2">
          <input
            type="search"
            name="q"
            defaultValue={query}
            aria-label="Search members by email"
            placeholder="Search by email"
            className={`${inputClass} min-w-0 flex-1`}
          />
          <button type="submit" className={secondaryButtonClass}>
            Search
          </button>
          {query && (
            <Link
              href="/admin/members"
              className={`${secondaryButtonClass} border-transparent`}
            >
              Clear
            </Link>
          )}
        </form>

        <div className={tableWrapClass}>
          <table className={tableClass}>
            <thead className={theadClass}>
              <tr>
                <th scope="col" className={thClass}>
                  Email
                </th>
                <th scope="col" className={thClass}>
                  Roles
                </th>
                <th scope="col" className={thClass}>
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {list.rows.length === 0 ? (
                <tr className={trClass}>
                  <td colSpan={3} className={`${tdClass} text-zinc-600`}>
                    {query
                      ? `No members match "${query}".`
                      : "No members yet. Add some above."}
                  </td>
                </tr>
              ) : (
                list.rows.map((member) => (
                  <tr key={member.email} className={trClass}>
                    <td className={`${tdClass} [overflow-wrap:anywhere]`}>
                      {member.email.split("@")[0]}
                      <wbr />@{member.email.split("@").slice(1).join("@")}
                    </td>
                    <td className={tdClass}>
                      <div className="flex flex-wrap gap-1">
                        {member.roles.map((role) => (
                          <Badge
                            key={role}
                            tone={role === "admin" ? "brand" : "neutral"}
                          >
                            {ROLE_LABELS[role as Role] ?? role}
                          </Badge>
                        ))}
                        {isEnvAdminEmail(member.email) && (
                          <Badge tone="brand">Permanent admin</Badge>
                        )}
                      </div>
                    </td>
                    <td className={tdClass}>
                      <div className="flex flex-col items-start gap-2">
                        <details>
                          <summary className={`${linkClass} cursor-pointer text-sm`}>
                            Edit roles
                          </summary>
                          <form
                            action={setRolesAction}
                            className="mt-2 flex flex-col gap-2 rounded-lg border border-zinc-200 p-3 dark:border-zinc-800"
                          >
                            <input
                              type="hidden"
                              name="email"
                              value={member.email}
                            />
                            <input type="hidden" name="back" value={back} />
                            {ROLES.map((role) => (
                              <label
                                key={role}
                                className="flex items-center gap-2 text-sm"
                              >
                                <input
                                  type="checkbox"
                                  name="roles"
                                  value={role}
                                  defaultChecked={member.roles.includes(role)}
                                />
                                {ROLE_LABELS[role]}
                              </label>
                            ))}
                            <button type="submit" className={primaryButtonClass}>
                              Save roles
                            </button>
                          </form>
                        </details>
                        <form action={removeMemberAction}>
                          <input
                            type="hidden"
                            name="email"
                            value={member.email}
                          />
                          <input type="hidden" name="back" value={back} />
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

        <div className="flex items-center justify-between gap-4 text-sm">
          <p className="text-zinc-600 dark:text-zinc-400">
            {list.total === 0
              ? "0 results"
              : `Showing ${first}-${last} of ${list.total.toLocaleString()}`}
          </p>
          <div className="flex gap-3">
            {list.page > 1 ? (
              <Link href={membersHref(query, list.page - 1)} className={linkClass}>
                Previous
              </Link>
            ) : (
              <span className="text-zinc-400">Previous</span>
            )}
            {list.page < list.pages ? (
              <Link href={membersHref(query, list.page + 1)} className={linkClass}>
                Next
              </Link>
            ) : (
              <span className="text-zinc-400">Next</span>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
