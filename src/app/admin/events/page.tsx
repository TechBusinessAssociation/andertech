import Link from "next/link";
import { formatDay, timeRange } from "@/lib/event-format";
import { getAdminEvents, getEventCategories } from "@/lib/members-db";
import { requireAdmin } from "@/lib/require-admin";
import { removeEventAction, saveEventAction } from "./actions";
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
  searchParams: Promise<{ edit?: string; show?: string; notice?: string }>;
};

const NOTICES: Record<string, string> = {
  invalid:
    "Not saved: an event needs a title, a category, a date, and (if given) a link starting with http:// or https://.",
};

export default async function AdminEventsPage({ searchParams }: Props) {
  await requireAdmin();

  const { edit, show, notice } = await searchParams;
  const showAll = show === "all";

  const [all, categories] = await Promise.all([
    getAdminEvents(),
    getEventCategories(),
  ]);

  // "Today" in LA (YYYY-MM-DD), matching how the members page decides what's
  // upcoming. Dates are plain strings, so a string compare is correct.
  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "America/Los_Angeles",
  });
  const upcomingCount = all.filter((e) => e.event_date >= today).length;
  const events = showAll ? all : all.filter((e) => e.event_date >= today);
  const editing = edit
    ? all.find((event) => Number(event.id) === Number(edit))
    : undefined;
  const back = showAll ? "/admin/events?show=all" : "/admin/events";

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Events"
        description="Members-only events shown on the members events page. Times are Pacific; past events drop off that page automatically."
      />

      {notice && NOTICES[notice] && <Notice message={NOTICES[notice]} />}

      <section className={cardClass} aria-labelledby="event-form">
        <h2 id="event-form" className="font-semibold">
          {editing ? `Edit: ${editing.title}` : "Add event"}
        </h2>
        <form
          key={editing?.id ?? "new"}
          action={saveEventAction}
          className="flex flex-col gap-3"
        >
          {editing && <input type="hidden" name="id" value={editing.id} />}
          <div className="flex flex-col gap-3 sm:flex-row">
            <label className={`${fieldLabelClass} sm:flex-[2]`}>
              Title
              <input
                name="title"
                required
                defaultValue={editing?.title}
                className={`${inputClass} font-normal`}
              />
            </label>
            <label className={`${fieldLabelClass} sm:flex-1`}>
              Category
              <input
                name="category"
                required
                list="event-categories"
                defaultValue={editing?.category}
                placeholder="e.g. Education"
                className={`${inputClass} font-normal`}
              />
              <datalist id="event-categories">
                {categories.map((name) => (
                  <option key={name} value={name} />
                ))}
              </datalist>
            </label>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <label className={`${fieldLabelClass} sm:flex-1`}>
              Date
              <input
                name="event_date"
                type="date"
                required
                defaultValue={editing?.event_date}
                className={`${inputClass} font-normal`}
              />
            </label>
            <label className={`${fieldLabelClass} sm:flex-1`}>
              Start (optional)
              <input
                name="start_time"
                type="time"
                defaultValue={editing?.start_time ?? ""}
                className={`${inputClass} font-normal`}
              />
            </label>
            <label className={`${fieldLabelClass} sm:flex-1`}>
              End (optional)
              <input
                name="end_time"
                type="time"
                defaultValue={editing?.end_time ?? ""}
                className={`${inputClass} font-normal`}
              />
            </label>
          </div>
          <label className={fieldLabelClass}>
            Location (optional)
            <input
              name="location"
              defaultValue={editing?.location ?? ""}
              placeholder="e.g. D310"
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
            Details / RSVP link (optional)
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
              {editing ? "Save changes" : "Add event"}
            </button>
            {editing && (
              <Link href={back} className={secondaryButtonClass}>
                Cancel
              </Link>
            )}
          </div>
        </form>
      </section>

      <div className="flex items-center justify-between gap-4 text-sm">
        <p className="text-zinc-600 dark:text-zinc-400">
          {showAll
            ? `All events (${all.length})`
            : `Upcoming events (${upcomingCount})`}
        </p>
        {showAll ? (
          <Link href="/admin/events" className={linkClass}>
            Show upcoming only
          </Link>
        ) : (
          <Link href="/admin/events?show=all" className={linkClass}>
            Show past events too
          </Link>
        )}
      </div>

      <div className={tableWrapClass}>
        <table className={`${tableClass} min-w-[44rem]`}>
          <thead className={theadClass}>
            <tr>
              <th scope="col" className={thClass}>
                Date
              </th>
              <th scope="col" className={thClass}>
                Time
              </th>
              <th scope="col" className={thClass}>
                Event
              </th>
              <th scope="col" className={thClass}>
                Category
              </th>
              <th scope="col" className={thClass}>
                Location
              </th>
              <th scope="col" className={thClass}>
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {events.length === 0 ? (
              <tr className={trClass}>
                <td colSpan={6} className={`${tdClass} text-zinc-600`}>
                  {showAll ? "No events yet." : "No upcoming events."}
                </td>
              </tr>
            ) : (
              events.map((event) => (
                <tr key={event.id} className={trClass}>
                  <td className={`${tdClass} whitespace-nowrap`}>
                    {formatDay(event.event_date)}
                    {event.event_date < today && (
                      <span className="ml-2 text-xs text-zinc-500">past</span>
                    )}
                  </td>
                  <td className={`${tdClass} whitespace-nowrap`}>
                    {timeRange(event) ?? ""}
                  </td>
                  <td className={`${tdClass} font-medium`}>
                    {event.url ? (
                      <a
                        href={event.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={linkClass}
                      >
                        {event.title}
                      </a>
                    ) : (
                      event.title
                    )}
                  </td>
                  <td className={tdClass}>
                    <Badge>{event.category}</Badge>
                  </td>
                  <td className={tdClass}>{event.location ?? ""}</td>
                  <td className={tdClass}>
                    <div className="flex items-center gap-4">
                      <Link
                        href={`/admin/events?edit=${event.id}${
                          showAll ? "&show=all" : ""
                        }#event-form`}
                        className={`${linkClass} text-sm`}
                      >
                        Edit
                      </Link>
                      <form action={removeEventAction}>
                        <input type="hidden" name="id" value={event.id} />
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
    </div>
  );
}
