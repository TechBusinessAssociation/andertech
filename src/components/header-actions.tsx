"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ThemeToggle } from "./theme-toggle";

// Right side of the site header: Admin console (admins only), Login (or
// Members once signed in), and the light/dark switch. The server-rendered HTML
// is the signed-out version, "Login", so pages stay statically rendered; the
// browser then asks /api/me who is signed in and swaps in "Members" and the
// Admin link where they apply.
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

  return (
    <div className="flex items-center gap-1.5 sm:gap-3">
      {status.admin && (
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
        href={status.signedIn ? "/members" : "/sign-in"}
        className="inline-flex min-h-9 items-center rounded-full border border-zinc-300 px-3.5 text-sm font-medium text-zinc-800 hover:bg-zinc-100"
      >
        {status.signedIn ? "Members" : "Login"}
      </Link>
      <ThemeToggle />
    </div>
  );
}
