"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { signOutAction } from "@/lib/auth-actions";
import { ThemeToggle } from "./theme-toggle";

// Right side of the site header: Admin console (admins only), Home (signed-in
// visitors only: a clear way back to the public landing page), a Members
// dropdown (Members home + Sign out) once signed in, or a plain Sign in
// link, and the light/dark switch. The server-rendered HTML is the
// signed-out version, "Sign in", so pages stay statically rendered; the
// browser then asks /api/me who is signed in and swaps in "Home", "Members"
// and the Admin link where they apply. The page you are on is highlighted.
// The dropdown is a plain <details>/<summary> (same pattern as the board
// list) rather than a hand-rolled popup with click-outside/Escape handling
// -- it's keyboard- and screen-reader-accessible for free and needs no
// extra JavaScript.
const pill =
  "inline-flex min-h-9 items-center gap-1.5 rounded-full border text-sm font-medium";
const pillIdle = "border-zinc-300 text-zinc-800 hover:bg-zinc-100";
const pillCurrent = "border-brand-blue bg-brand-sky text-brand-navy";

export function HeaderActions() {
  const pathname = usePathname();
  const [status, setStatus] = useState({ signedIn: false, admin: false });

  // Re-check on every navigation so the links update after signing in or out.
  useEffect(() => {
    let cancelled = false;
    fetch("/api/me", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (!cancelled) {
          setStatus({
            signedIn: data?.signedIn === true,
            admin: data?.admin === true,
          });
        }
      })
      .catch(() => {
        if (!cancelled) setStatus({ signedIn: false, admin: false });
      });
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  const onHome = pathname === "/";
  const onMembers = pathname.startsWith("/members");

  return (
    <div className="flex items-center gap-1 sm:gap-3">
      {status.admin && (
        <Link
          href="/admin"
          aria-label="Admin console"
          className="inline-flex min-h-9 min-w-9 items-center justify-center rounded-full bg-brand-navy px-2.5 text-sm font-medium text-white hover:bg-brand-blue sm:px-3.5"
        >
          {/* An icon on phones so the header fits; the label is still the
              link's accessible name (aria-label above). */}
          <svg
            viewBox="0 0 16 16"
            className="size-4 sm:hidden"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect x="2" y="2" width="5" height="5" rx="1" />
            <rect x="9" y="2" width="5" height="5" rx="1" />
            <rect x="2" y="9" width="5" height="5" rx="1" />
            <rect x="9" y="9" width="5" height="5" rx="1" />
          </svg>
          <span className="hidden sm:inline">Admin console</span>
        </Link>
      )}
      {status.signedIn && (
        <Link
          href="/"
          aria-label="Home (public site)"
          aria-current={onHome ? "page" : undefined}
          className={`${pill} min-w-9 justify-center px-2.5 sm:px-3.5 ${onHome ? pillCurrent : pillIdle}`}
        >
          <svg
            viewBox="0 0 16 16"
            className="size-4 shrink-0"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M2 7.2 8 2l6 5.2V13a1 1 0 0 1-1 1h-3v-4H6v4H3a1 1 0 0 1-1-1V7.2Z" />
          </svg>
          <span className="hidden sm:inline">Home</span>
        </Link>
      )}
      {status.signedIn ? (
        <details className="group relative">
          <summary
            aria-current={onMembers ? "page" : undefined}
            className={`${pill} cursor-pointer list-none px-3 sm:px-3.5 ${onMembers ? pillCurrent : pillIdle}`}
          >
            Members
            <svg
              viewBox="0 0 16 16"
              className="hidden size-3.5 shrink-0 transition-transform sm:block group-open:rotate-180"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M4 6.5 8 10l4-3.5" />
            </svg>
          </summary>
          {/* Plain light styling like the rest of the header (see the
              comment in header.tsx: the header stays on a fixed white
              plate in both modes), not dark: variants. */}
          <div className="absolute right-0 z-20 mt-2 w-44 overflow-hidden rounded-xl border border-zinc-200 bg-white py-1 shadow-lg">
            <Link
              href="/members"
              className="block px-3.5 py-2 text-sm text-zinc-800 hover:bg-zinc-100"
            >
              Members home
            </Link>
            <Link
              href="/members/profile"
              className="block px-3.5 py-2 text-sm text-zinc-800 hover:bg-zinc-100"
            >
              Edit profile
            </Link>
            <form
              action={signOutAction}
              className="border-t border-zinc-200"
            >
              <button
                type="submit"
                className="block w-full px-3.5 py-2 text-left text-sm text-zinc-800 hover:bg-zinc-100"
              >
                Sign out
              </button>
            </form>
          </div>
        </details>
      ) : (
        <Link
          href="/sign-in"
          className={`${pill} px-3 sm:px-3.5 ${pillIdle}`}
        >
          Sign in
        </Link>
      )}
      <ThemeToggle />
    </div>
  );
}
