import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth, signOut } from "@/auth";
import { isAdminEmail } from "@/lib/admin";
import {
  addMembers,
  removeMember,
  searchMembers,
  countMembers,
  addResource,
  removeResource,
  getMemberResources,
} from "@/lib/members-db";

type AdminPageProps = {
  searchParams: Promise<{ q?: string }>;
};

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

  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  const [total, matches, resources] = await Promise.all([
    countMembers(),
    query ? searchMembers(query) : Promise.resolve<string[]>([]),
    getMemberResources(),
  ]);

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

  async function addResourceAction(formData: FormData) {
    "use server";
    const label = String(formData.get("label") ?? "");
    const url = String(formData.get("url") ?? "");
    await addResource(label, url);
    revalidatePath("/admin");
  }

  async function removeResourceAction(formData: FormData) {
    "use server";
    const id = Number(formData.get("id"));
    if (Number.isFinite(id)) {
      await removeResource(id);
    }
    revalidatePath("/admin");
  }

  return (
    <main className="mx-auto flex max-w-2xl flex-1 flex-col gap-10 px-6 py-16">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Admin</h1>
        <p className="text-zinc-700 dark:text-zinc-300">
          Signed in as {email}
        </p>
      </div>

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
        <h2 className="text-xl font-semibold">Resources</h2>

        {resources.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {resources.map((resource) => (
              <li
                key={resource.id}
                className="flex items-center justify-between gap-2 text-sm"
              >
                <span>
                  {resource.label}{" "}
                  <span className="text-zinc-500">-- {resource.url}</span>
                </span>
                <form action={removeResourceAction}>
                  <input type="hidden" name="id" value={resource.id} />
                  <button
                    type="submit"
                    className="text-red-700 underline hover:text-red-900 dark:text-red-400"
                  >
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
            placeholder="Label, e.g. Recruiting Dashboard"
            className="rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          />
          <input
            name="url"
            placeholder="https://..."
            className="rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          />
          <button
            type="submit"
            className="inline-flex w-fit items-center rounded-lg bg-brand-navy px-4 py-2 text-sm font-medium text-white hover:bg-brand-blue"
          >
            Add resource
          </button>
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
