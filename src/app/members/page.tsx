import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { getMemberResources, isApprovedMember } from "@/lib/members-workbook";

// middleware.ts only confirms a signed-in Google session (Edge-safe,
// cheap check) -- it can't import isApprovedMember itself, since that
// needs Node's `crypto` via @azure/msal-node, which the Edge runtime
// can't load (see middleware.ts and auth.config.ts's comments). So the
// actual live membership re-check -- the 24h/60s cache policy, catching
// someone removed from the workbook -- happens here instead, on every
// load of this page (Node.js runtime, unaffected).
export default async function MembersPage() {
  const session = await auth();
  const email = session?.user?.email;

  if (!email || !(await isApprovedMember(email))) {
    redirect("/sign-in");
  }

  const resources = await getMemberResources();

  return (
    <main className="mx-auto flex max-w-2xl flex-1 flex-col gap-6 px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Members</h1>
      <p className="text-zinc-700 dark:text-zinc-300">Signed in as {email}</p>

      {resources.length > 0 ? (
        <ul className="flex flex-col gap-3">
          {resources.map((resource) => (
            <li key={resource.url}>
              <a
                className="text-brand-navy underline dark:text-brand-blue"
                href={resource.url}
              >
                {resource.label}
              </a>
            </li>
          ))}
        </ul>
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
