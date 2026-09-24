import Link from "next/link";
import { Logo } from "./logo";
import { site } from "../../content/site";
import { auth, signOut } from "@/auth";

// Simple site header. Kept on a fixed white plate (not dark-mode aware) --
// the logo's own colors are the brand, and a fixed light background keeps
// it readable without needing a separate dark-mode version of the logo.
//
// Shown on every page, including public ones -- a "Members" sign-in link
// leaks nothing, and this is the only discoverable way to reach /members.
export async function Header() {
  const session = await auth();

  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-2xl items-center justify-between px-6 py-4">
        <Link href="/" aria-label={site.name}>
          <Logo className="h-9 w-auto" />
        </Link>

        {session?.user ? (
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <button
              type="submit"
              className="text-sm text-zinc-600 underline hover:text-zinc-900"
            >
              Sign out
            </button>
          </form>
        ) : (
          <Link
            href="/sign-in"
            className="text-sm text-zinc-600 underline hover:text-zinc-900"
          >
            Members
          </Link>
        )}
      </div>
    </header>
  );
}
