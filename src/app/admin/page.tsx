import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth, signOut } from "@/auth";
import { isAdminEmail } from "@/lib/admin";
import {
  addMembers,
  removeMember,
  searchMembers,
  countMembers,
  getCategories,
  addCategory,
  updateCategory,
  removeCategory,
  getAdminResources,
  addResource,
  removeResource,
  getAdminEvents,
  getEventCategories,
  addEvent,
  updateEvent,
  removeEvent,
  type EventInput,
} from "@/lib/members-db";

type AdminPageProps = {
  searchParams: Promise<{ q?: string; editEvent?: string; notice?: string }>;
};

const NOTICES: Record<string, string> = {
  "category-in-use":
    "That category still has resources in it. Move or remove them first.",
  "resource-invalid":
    "Resource not added: it needs a label, a category, and a link starting with http:// or https://.",
  "event-invalid":
    "Event not saved: it needs a title, a category, a date, and (if given) a link starting with http:// or https://.",
};

const inputClass =
  "rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900";
const primaryButtonClass =
  "inline-flex w-fit items-center rounded-lg bg-brand-navy px-4 py-2 text-sm font-medium text-white hover:bg-brand-blue";
const removeButtonClass =
  "text-red-700 underline hover:text-red-900 dark:text-red-400";

function eventInputFrom(formData: FormData): EventInput {
  const field = (name: string) => String(formData.get(name) ?? "");
  return {
    title: field("title"),
    category: field("category"),
    eventDate: field("event_date"),
    startTime: field("start_time"),
    endTime: field("end_time"),
    location: field("location"),
    description: field("description"),
    url: field("url"),
  };
}

// Every action that changes what members see also revalidates /members
// (and /members/events), so edits show up without waiting on a cache.
// Must stay at module level: the inline "use server" actions below capture
// anything declared inside AdminPage as a bound argument, and a plain
// function can't be serialized that way (it 500s after the action runs).
function refresh() {
  revalidatePath("/admin");
  revalidatePath("/members");
  revalidatePath("/members/events");
}

function orderNumber(value: FormDataEntryValue | null): number {
  const n = Number(value);
  return Number.isFinite(n) ? Math.trunc(n) : 0;
}

// Gated the same way as /members (middleware confirms a session; this
// page does the real authorization check), plus an extra one: being an
// approved member isn't enough here, the email must also be in
// ADMIN_EMAILS. This is the only place the club edits the member list
// and resource links -- no SQL, no spreadsheet.
export default async function AdminPage({ searchParams }: AdminPageProps) {
  const session = await auth();
  const email = session?.user?.email;

  if (!email || !isAdminEmail(email)) {
    redirect("/sign-in");
  }

  const { q, editEvent, notice } = await searchParams;
  const query = q?.trim() ?? "";
  const editEventId = Number(editEvent);

  const [total, matches, categories, resources, events, eventCategories] =
    await Promise.all([
      countMembers(),
      query ? searchMembers(query) : Promise.resolve<string[]>([]),
      getCategories(),
      getAdminResources(),
      getAdminEvents(),
      getEventCategories(),
    ]);
  const editing = Number.isFinite(editEventId)
    ? // Postgres returns bigserial ids as strings, hence Number().
      events.find((event) => Number(event.id) === editEventId)
    : undefined;

  async function addMembersAction(formData: FormData) {
    "use server";
    const raw = String(formData.get("emails") ?? "");
    const emails = raw
      .split(/[\n,]/)
      .map((e) => e.trim())
      .filter(Boolean);
    await addMembers(emails);
    revalidatePath("/admin");
  }

  async function removeMemberAction(formData: FormData) {
    "use server";
    const target = String(formData.get("email") ?? "");
    await removeMember(target);
    revalidatePath("/admin");
  }

  async function addCategoryAction(formData: FormData) {
    "use server";
    await addCategory(
      String(formData.get("name") ?? ""),
      String(formData.get("description") ?? ""),
      orderNumber(formData.get("sort_order")),
    );
    refresh();
  }

  async function updateCategoryAction(formData: FormData) {
    "use server";
    const id = Number(formData.get("id"));
    if (Number.isFinite(id)) {
      await updateCategory(
        id,
        String(formData.get("name") ?? ""),
        String(formData.get("description") ?? ""),
        orderNumber(formData.get("sort_order")),
      );
    }
    refresh();
  }

  async function removeCategoryAction(formData: FormData) {
    "use server";
    const id = Number(formData.get("id"));
    if (Number.isFinite(id) && !(await removeCategory(id))) {
      refresh();
      redirect("/admin?notice=category-in-use");
    }
    refresh();
  }

  async function addResourceAction(formData: FormData) {
    "use server";
    const categoryId = Number(formData.get("category_id"));
    const added =
      Number.isFinite(categoryId) &&
      (await addResource({
        label: String(formData.get("label") ?? ""),
        url: String(formData.get("url") ?? ""),
        description: String(formData.get("description") ?? ""),
        categoryId,
        sortOrder: orderNumber(formData.get("sort_order")),
      }));
    refresh();
    if (!added) redirect("/admin?notice=resource-invalid");
  }

  async function removeResourceAction(formData: FormData) {
    "use server";
    const id = Number(formData.get("id"));
    if (Number.isFinite(id)) {
      await removeResource(id);
    }
    refresh();
  }

  async function saveEventAction(formData: FormData) {
    "use server";
    const input = eventInputFrom(formData);
    const rawId = formData.get("id");
    const saved = rawId
      ? await updateEvent(Number(rawId), input)
      : await addEvent(input);
    refresh();
    redirect(saved ? "/admin" : "/admin?notice=event-invalid");
  }

  async function removeEventAction(formData: FormData) {
    "use server";
    const id = Number(formData.get("id"));
    if (Number.isFinite(id)) {
      await removeEvent(id);
    }
    refresh();
  }

  return (
    <main className="mx-auto flex max-w-2xl flex-1 flex-col gap-10 px-6 py-16">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Admin</h1>
        <p className="text-zinc-700 dark:text-zinc-300">
          Signed in as {email}
        </p>
      </div>

      {notice && NOTICES[notice] && (
        <p
          role="alert"
          className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-100"
        >
          {NOTICES[notice]}
        </p>
      )}

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">
          Members ({total.toLocaleString()})
        </h2>

        <form action={addMembersAction} className="flex flex-col gap-2">
          <label className="text-sm font-medium" htmlFor="emails">
            Add member(s) -- one email per line, or comma-separated
          </label>
          <textarea
            id="emails"
            name="emails"
            rows={4}
            className="rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
            placeholder="jane.doe@anderson.ucla.edu"
          />
          <button
            type="submit"
            className="inline-flex w-fit items-center rounded-lg bg-brand-navy px-4 py-2 text-sm font-medium text-white hover:bg-brand-blue"
          >
            Add
          </button>
        </form>

        <form action="/admin" className="flex gap-2">
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Search members by email"
            className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          />
          <button
            type="submit"
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-700"
          >
            Search
          </button>
        </form>

        {query && (
          <ul className="flex flex-col gap-1">
            {matches.length === 0 ? (
              <li className="text-sm text-zinc-600 dark:text-zinc-400">
                No matches for &quot;{query}&quot;.
              </li>
            ) : (
              matches.map((memberEmail) => (
                <li
                  key={memberEmail}
                  className="flex items-center justify-between gap-2 text-sm"
                >
                  <span>{memberEmail}</span>
                  <form action={removeMemberAction}>
                    <input type="hidden" name="email" value={memberEmail} />
                    <button
                      type="submit"
                      className="text-red-700 underline hover:text-red-900 dark:text-red-400"
                    >
                      Remove
                    </button>
                  </form>
                </li>
              ))
            )}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-4 border-t border-zinc-200 pt-8 dark:border-zinc-800">
        <h2 className="text-xl font-semibold">Resource categories</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Groups on the members page, shown in order (lowest number first).
          Leave gaps (10, 20, 30) so a new one can slot in between.
        </p>

        <ul className="flex flex-col gap-3">
          {categories.map((category) => (
            <li key={category.id} className="flex flex-col gap-2">
              <form
                action={updateCategoryAction}
                className="flex flex-col gap-2 sm:flex-row"
              >
                <input type="hidden" name="id" value={category.id} />
                <input
                  name="name"
                  aria-label="Category name"
                  defaultValue={category.name}
                  required
                  className={`${inputClass} sm:w-40`}
                />
                <input
                  name="description"
                  aria-label="Category description"
                  defaultValue={category.description ?? ""}
                  placeholder="Short description (optional)"
                  className={`${inputClass} sm:flex-1`}
                />
                <input
                  name="sort_order"
                  type="number"
                  aria-label="Category order"
                  defaultValue={category.sort_order}
                  className={`${inputClass} sm:w-20`}
                />
                <button
                  type="submit"
                  className="rounded-lg border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-700"
                >
                  Save
                </button>
              </form>
              <form action={removeCategoryAction}>
                <input type="hidden" name="id" value={category.id} />
                <button type="submit" className={`text-sm ${removeButtonClass}`}>
                  Remove {category.name}
                </button>
              </form>
            </li>
          ))}
        </ul>

        <form
          action={addCategoryAction}
          className="flex flex-col gap-2 sm:flex-row"
        >
          <input
            name="name"
            aria-label="New category name"
            placeholder="New category"
            required
            className={`${inputClass} sm:w-40`}
          />
          <input
            name="description"
            aria-label="New category description"
            placeholder="Short description (optional)"
            className={`${inputClass} sm:flex-1`}
          />
          <input
            name="sort_order"
            type="number"
            aria-label="New category order"
            defaultValue={50}
            className={`${inputClass} sm:w-20`}
          />
          <button type="submit" className={primaryButtonClass}>
            Add category
          </button>
        </form>
      </section>

      <section className="flex flex-col gap-4 border-t border-zinc-200 pt-8 dark:border-zinc-800">
        <h2 className="text-xl font-semibold">Resources</h2>

        {resources.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {resources.map((resource) => (
              <li
                key={resource.id}
                className="flex items-center justify-between gap-2 text-sm"
              >
                <span>
                  <span className="text-zinc-500">
                    {resource.category_name ?? "Other"} /{" "}
                  </span>
                  {resource.label}{" "}
                  <span className="break-all text-zinc-500">
                    -- {resource.url}
                  </span>
                </span>
                <form action={removeResourceAction}>
                  <input type="hidden" name="id" value={resource.id} />
                  <button type="submit" className={removeButtonClass}>
                    Remove
                  </button>
                </form>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            No resources yet.
          </p>
        )}

        <form action={addResourceAction} className="flex flex-col gap-2">
          <input
            name="label"
            aria-label="Resource label"
            placeholder="Label, e.g. Summer Guide"
            required
            className={inputClass}
          />
          <input
            name="url"
            type="url"
            aria-label="Resource link"
            placeholder="https://..."
            required
            className={inputClass}
          />
          <input
            name="description"
            aria-label="Resource description"
            placeholder="One-line description (optional)"
            className={inputClass}
          />
          <div className="flex flex-col gap-2 sm:flex-row">
            <select
              name="category_id"
              aria-label="Resource category"
              required
              defaultValue=""
              className={`${inputClass} sm:flex-1`}
            >
              <option value="" disabled>
                Choose a category
              </option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <input
              name="sort_order"
              type="number"
              aria-label="Order within category"
              defaultValue={0}
              className={`${inputClass} sm:w-28`}
            />
          </div>
          <button type="submit" className={primaryButtonClass}>
            Add resource
          </button>
        </form>
      </section>

      <section className="flex flex-col gap-4 border-t border-zinc-200 pt-8 dark:border-zinc-800">
        <h2 className="text-xl font-semibold">Events</h2>

        {events.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {events.map((event) => (
              <li
                key={event.id}
                className="flex items-center justify-between gap-2 text-sm"
              >
                <span>
                  <span className="text-zinc-500">{event.event_date} -- </span>
                  {event.title}{" "}
                  <span className="text-zinc-500">({event.category})</span>
                </span>
                <span className="flex shrink-0 gap-3">
                  <a
                    href={`/admin?editEvent=${event.id}#event-form`}
                    className="underline"
                  >
                    Edit
                  </a>
                  <form action={removeEventAction}>
                    <input type="hidden" name="id" value={event.id} />
                    <button type="submit" className={removeButtonClass}>
                      Remove
                    </button>
                  </form>
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            No events yet.
          </p>
        )}

        <form
          id="event-form"
          key={editing?.id ?? "new"}
          action={saveEventAction}
          className="flex flex-col gap-2"
        >
          <h3 className="font-medium">
            {editing ? `Editing: ${editing.title}` : "Add event"}
          </h3>
          {editing && <input type="hidden" name="id" value={editing.id} />}
          <input
            name="title"
            aria-label="Event title"
            placeholder="Title"
            required
            defaultValue={editing?.title}
            className={inputClass}
          />
          <input
            name="category"
            aria-label="Event category"
            placeholder="Category, e.g. Education"
            list="event-categories"
            required
            defaultValue={editing?.category}
            className={inputClass}
          />
          <datalist id="event-categories">
            {eventCategories.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>
          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="flex flex-1 flex-col gap-1 text-sm">
              Date
              <input
                name="event_date"
                type="date"
                required
                defaultValue={editing?.event_date}
                className={inputClass}
              />
            </label>
            <label className="flex flex-1 flex-col gap-1 text-sm">
              Start (optional)
              <input
                name="start_time"
                type="time"
                defaultValue={editing?.start_time ?? ""}
                className={inputClass}
              />
            </label>
            <label className="flex flex-1 flex-col gap-1 text-sm">
              End (optional)
              <input
                name="end_time"
                type="time"
                defaultValue={editing?.end_time ?? ""}
                className={inputClass}
              />
            </label>
          </div>
          <input
            name="location"
            aria-label="Event location"
            placeholder="Location, e.g. D310"
            defaultValue={editing?.location ?? ""}
            className={inputClass}
          />
          <textarea
            name="description"
            aria-label="Event description"
            rows={3}
            placeholder="Description (optional)"
            defaultValue={editing?.description ?? ""}
            className={inputClass}
          />
          <input
            name="url"
            type="url"
            aria-label="Event link"
            placeholder="Details / RSVP link (optional) https://..."
            defaultValue={editing?.url ?? ""}
            className={inputClass}
          />
          <div className="flex items-center gap-4">
            <button type="submit" className={primaryButtonClass}>
              {editing ? "Save changes" : "Add event"}
            </button>
            {editing && (
              <a href="/admin" className="text-sm underline">
                Cancel
              </a>
            )}
          </div>
        </form>
      </section>

      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/" });
        }}
      >
        <button
          type="submit"
          className="text-sm text-zinc-600 underline hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          Sign out
        </button>
      </form>
    </main>
  );
}
