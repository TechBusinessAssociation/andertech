import Link from "next/link";
import { signOut } from "@/auth";
import { countPendingRequests } from "@/lib/access-requests";
import { requireAdmin } from "@/lib/require-admin";
import { AdminNav } from "./nav";

// This check only decides whether to draw the sidebar. It is NOT the
// security boundary: layouts don't re-render on client-side navigation, so
// every /admin page and every admin server action calls requireAdmin() itself.
export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const email = await requireAdmin();
  const pendingRequests = await countPendingRequests();

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-6 md:flex-row md:gap-10 md:px-6 md:py-10">
      <aside className="md:w-56 md:shrink-0">
        <div className="flex flex-col gap-4 md:sticky md:top-6">
          <div>
            <p className="text-lg font-semibold">Admin</p>
            <p className="break-all text-xs text-zinc-600 dark:text-zinc-400">
              {email}
            </p>
          </div>

          <AdminNav pendingRequests={pendingRequests} />

          <div className="flex gap-4 text-sm md:flex-col md:gap-2">
            <Link
              href="/members"
              className="text-zinc-600 underline hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              Back to members
            </Link>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <button
                type="submit"
                className="text-zinc-600 underline hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </aside>

      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
