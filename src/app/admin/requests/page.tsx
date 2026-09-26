import { getAccessRequests } from "@/lib/access-requests";
import { requireAdmin } from "@/lib/require-admin";
import { approveRequestAction, rejectRequestAction } from "./actions";
import {
  Badge,
  Notice,
  PageHeader,
  dangerButtonClass,
  primaryButtonClass,
  tableClass,
  tableWrapClass,
  tdClass,
  theadClass,
  thClass,
  trClass,
} from "../ui";

type Props = {
  searchParams: Promise<{ notice?: string }>;
};

const NOTICES: Record<string, string> = {
  approved:
    "Approved. They are now a member and can sign in with that Google account. There is no automatic email, so let them know.",
  rejected: "Rejected. They can send a new request later if they want to.",
};

export default async function AdminRequestsPage({ searchParams }: Props) {
  await requireAdmin();

  const { notice } = await searchParams;
  const { pending, decided, setupNeeded } = await getAccessRequests();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Requests"
        description="People who asked for an account on the request page. Approving adds them as a Club member; they then sign in with that Google account. Nobody is emailed automatically."
      />

      {setupNeeded && (
        <Notice message="The requests table hasn't been set up yet in this database, so requests can't be saved or shown. Run the latest schema.sql (Vercel dashboard, Storage, your database, Query tab; it is safe to run more than once), then reload this page. See the README." />
      )}

      {notice && NOTICES[notice] && <Notice message={NOTICES[notice]} />}

      {!setupNeeded && (
        <>
      <section className="flex flex-col gap-3" aria-labelledby="pending-heading">
        <h2 id="pending-heading" className="font-semibold">
          Pending ({pending.length})
        </h2>
        <div className={tableWrapClass}>
          <table className={tableClass}>
            <thead className={theadClass}>
              <tr>
                <th scope="col" className={thClass}>
                  Name
                </th>
                <th scope="col" className={thClass}>
                  Email
                </th>
                <th scope="col" className={`${thClass} hidden sm:table-cell`}>
                  Requested (Pacific)
                </th>
                <th scope="col" className={thClass}>
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {pending.length === 0 ? (
                <tr className={trClass}>
                  <td colSpan={4} className={`${tdClass} text-zinc-600`}>
                    No pending requests.
                  </td>
                </tr>
              ) : (
                pending.map((request) => (
                  <tr key={request.id} className={trClass}>
                    <td className={`${tdClass} font-medium`}>{request.name}</td>
                    <td className={`${tdClass} break-all`}>{request.email}</td>
                    <td className={`${tdClass} hidden sm:table-cell`}>
                      {request.requested}
                    </td>
                    <td className={tdClass}>
                      <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-4">
                        <form action={approveRequestAction}>
                          <input type="hidden" name="id" value={request.id} />
                          <button type="submit" className={primaryButtonClass}>
                            Approve
                          </button>
                        </form>
                        <form action={rejectRequestAction}>
                          <input type="hidden" name="id" value={request.id} />
                          <button type="submit" className={dangerButtonClass}>
                            Reject
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
      </section>

      <section className="flex flex-col gap-3" aria-labelledby="decided-heading">
        <h2 id="decided-heading" className="font-semibold">
          Recently decided
        </h2>
        <div className={tableWrapClass}>
          <table className={`${tableClass} min-w-[36rem]`}>
            <thead className={theadClass}>
              <tr>
                <th scope="col" className={thClass}>
                  Name
                </th>
                <th scope="col" className={thClass}>
                  Email
                </th>
                <th scope="col" className={thClass}>
                  Result
                </th>
                <th scope="col" className={thClass}>
                  Decided (Pacific)
                </th>
                <th scope="col" className={thClass}>
                  By
                </th>
              </tr>
            </thead>
            <tbody>
              {decided.length === 0 ? (
                <tr className={trClass}>
                  <td colSpan={5} className={`${tdClass} text-zinc-600`}>
                    Nothing decided yet.
                  </td>
                </tr>
              ) : (
                decided.map((request) => (
                  <tr key={request.id} className={trClass}>
                    <td className={tdClass}>{request.name}</td>
                    <td className={`${tdClass} break-all`}>{request.email}</td>
                    <td className={tdClass}>
                      <Badge tone={request.status === "approved" ? "brand" : "neutral"}>
                        {request.status === "approved" ? "Approved" : "Rejected"}
                      </Badge>
                    </td>
                    <td className={`${tdClass} whitespace-nowrap`}>
                      {request.decided}
                    </td>
                    <td className={`${tdClass} break-all`}>
                      {request.decided_by}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
        </>
      )}
    </div>
  );
}
