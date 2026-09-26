"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ThemeToggle } from "./theme-toggle";

// Right side of the site header: Admin console (admins only), Members, and the
// light/dark switch. Only the Admin link needs to know who is signed in; it
// finds out from /api/me after the page loads, so pages stay statically
// rendered for everyone else.
export function HeaderActions() {
  const pathname = usePathname();
  const [admin, setAdmin] = useState(false);

  // Re-check on every navigation so the link disappears after signing out.
  useEffect(() => {
    let cancelled = false;
    fetch("/api/me", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (!cancelled) setAdmin(data?.admin === true);
      })
      .catch(() => {
        if (!cancelled) setAdmin(false);
      });
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  return (
    <div className="flex items-center gap-1 sm:gap-3">
      {admin && (
        <Link
          href="/admin"
          aria-label="Admin console"
          className="inline-flex min-h-9 items-center rounded-full bg-brand-navy px-3.5 text-sm font-medium text-white hover:bg-brand-blue"
        >
          <span className="sm:hidden">Admin</span>
          <span className="hidden sm:inline">Admin console</span>
        </Link>
      )}
      <Link
        href="/members"
        className="inline-flex min-h-10 items-center px-2 text-sm text-zinc-600 underline hover:text-zinc-900"
      >
        Members
      </Link>
      <ThemeToggle />
    </div>
  );
}
