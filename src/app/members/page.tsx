import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { isAdmin } from "@/lib/admin";
import { getResourceGroups, isApprovedMember } from "@/lib/members-db";

// middleware.ts only confirms a signed-in Google session (Edge-safe,
// cheap check) -- database access stays out of that bundle on purpose
// (see auth.config.ts and middleware.ts's comments). So the actual live
// membership re-check happens here instead, on every load of this page
// (Node.js runtime, unaffected).
export default async function MembersPage() {
  const session = await auth();
  const email = session?.user?.email;

  if (!email || !(await isApprovedMember(email))) {
    redirect("/sign-in");
  }

  const [groups, admin] = await Promise.all([
    getResourceGroups(),
    isAdmin(email),
  ]);

  return (
    <main className="mx-auto flex max-w-2xl flex-1 flex-col gap-8 px-6 py-16">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Members</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Signed in as {email}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <Link
          href="/members/events"
          className="inline-flex w-fit items-center rounded-lg bg-brand-navy px-4 py-2 text-sm font-medium text-white hover:bg-brand-blue"
        >
          Upcoming events
        </Link>
        {admin && (
          <Link
            href="/admin"
            className="text-sm text-zinc-600 underline hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            Admin
          </Link>
        )}
      </div>

      {groups.length > 0 ? (
        groups.map((group) => (
          <section key={group.name} className="flex flex-col gap-3">
            <div>
              <h2 className="text-xl font-semibold">{group.name}</h2>
              {group.description && (
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {group.description}
                </p>
              )}
            </div>
            <ul className="flex flex-col gap-3">
              {group.resources.map((resource) => (
                <li key={resource.id}>
                  <a
                    className="text-brand-navy underline dark:text-brand-blue"
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {resource.label}
                  </a>
                  {resource.description && (
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      {resource.description}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))
      ) : (
        <p className="text-zinc-600 dark:text-zinc-400">No resources yet.</p>
      )}

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
