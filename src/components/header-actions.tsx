"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ThemeToggle } from "./theme-toggle";

// Right side of the site header: Admin console (admins only), Home (signed-in
// visitors only: a clear way back to the public landing page), Login (or
// Members once signed in), and the light/dark switch. The server-rendered HTML
// is the signed-out version, "Login", so pages stay statically rendered; the
// browser then asks /api/me who is signed in and swaps in "Home", "Members" and
// the Admin link where they apply. The page you are on is highlighted.
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
      <Link
        href={status.signedIn ? "/members" : "/sign-in"}
        aria-current={status.signedIn && onMembers ? "page" : undefined}
        className={`${pill} px-3 sm:px-3.5 ${status.signedIn && onMembers ? pillCurrent : pillIdle}`}
      >
        {status.signedIn ? "Members" : "Login"}
      </Link>
      <ThemeToggle />
    </div>
  );
}
