"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { signOutAction } from "@/lib/auth-actions";
import { ThemeToggle } from "./theme-toggle";

// Right side of the site header. Places are plain text links (Newsletter,
// Members) with a gold underline on the page you are on; the only filled
// button is "Sign in" for signed-out visitors. Everything about the account
// (Admin console, User profile, Public site, Sign out) is in one avatar menu,
// and on phones that menu also holds Members and Newsletter so the header is
// just logo, theme switch and avatar. There is no separate "Home" button: the
// logo already goes to the public site, and the menu keeps a "Public site"
// entry.
//
// The server-rendered HTML is the signed-out version (Newsletter, theme
// switch, Sign in), so pages stay statically rendered; the browser then asks
// /api/me who is signed in and swaps in Members and the avatar. The menu is a
// plain <details>/<summary>; the small effect below only closes it after a
// click outside, Escape, or navigating.
const textLink =
  "border-b-2 py-1.5 text-[15px] font-medium transition-colors";
const textIdle = "border-transparent text-zinc-700 hover:text-brand-navy";
const textCurrent = "border-brand-gold text-brand-navy";

const menuItem =
  "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm text-zinc-800 hover:bg-zinc-100";
const menuIcon = "size-4 shrink-0 text-zinc-500";

const svgProps = {
  viewBox: "0 0 16 16",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

// "Utkarsh Singh Rawat" -> "UR"; one word -> its first letter.
function initials(name: string | null): string {
  const words = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "";
  const first = words[0][0];
  const last = words.length > 1 ? words[words.length - 1][0] : "";
  return (first + last).toUpperCase();
}

export function HeaderActions() {
  const pathname = usePathname();
  const menuRef = useRef<HTMLDetailsElement>(null);
  const [status, setStatus] = useState({
    signedIn: false,
    admin: false,
    newsletterAdmin: false,
    name: null as string | null,
  });

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
            newsletterAdmin: data?.newsletterAdmin === true,
            name: typeof data?.name === "string" ? data.name : null,
          });
        }
      })
      .catch(() => {
        if (!cancelled)
          setStatus({
            signedIn: false,
            admin: false,
            newsletterAdmin: false,
            name: null,
          });
      });
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  // Close the account menu after navigating, a click elsewhere, or Escape.
  useEffect(() => {
    const menu = menuRef.current;
    if (menu) menu.open = false;
  }, [pathname]);
  useEffect(() => {
    function onClick(event: MouseEvent) {
      const menu = menuRef.current;
      if (menu?.open && !menu.contains(event.target as Node)) menu.open = false;
    }
    function onKey(event: KeyboardEvent) {
      const menu = menuRef.current;
      if (event.key === "Escape" && menu?.open) {
        menu.open = false;
        menu.querySelector("summary")?.focus();
      }
    }
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const onMembers = pathname.startsWith("/members");
  const onNewsletter = pathname.startsWith("/newsletter");
  const isEditor = status.admin || status.newsletterAdmin;
  const mark = initials(status.name);

  return (
    <div className="flex items-center gap-1 sm:gap-3">
      <nav aria-label="Main" className="flex items-center gap-4 sm:gap-[22px]">
        {/* Signed-out visitors keep Newsletter in the bar on phones; for
            members it moves into the account menu there. */}
        <Link
          href="/newsletter"
          aria-current={onNewsletter ? "page" : undefined}
          className={`${textLink} ${status.signedIn ? "hidden sm:inline-block" : ""} ${
            onNewsletter ? textCurrent : textIdle
          }`}
        >
          Newsletter
        </Link>
        {status.signedIn && (
          <Link
            href="/members"
            aria-current={onMembers ? "page" : undefined}
            className={`${textLink} hidden sm:inline-block ${
              onMembers ? textCurrent : textIdle
            }`}
          >
            Members
          </Link>
        )}
      </nav>

      <ThemeToggle />

      {status.signedIn ? (
        <details ref={menuRef} className="relative">
          <summary
            aria-label="Account menu"
            className="grid size-9 cursor-pointer list-none place-items-center rounded-full border border-[#b6cfe4] bg-brand-sky text-[13px] font-semibold tracking-wide text-brand-navy hover:border-brand-blue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue [&::-webkit-details-marker]:hidden"
          >
            {mark || (
              <svg {...svgProps} className="size-4">
                <circle cx="8" cy="5.5" r="2.5" />
                <path d="M3 13.5c.6-2.4 2.6-3.5 5-3.5s4.4 1.1 5 3.5" />
              </svg>
            )}
          </summary>
          {/* Plain light styling like the rest of the header (see the
              comment in header.tsx: the header stays on a fixed white plate
              in both modes), not dark: variants. */}
          <div className="absolute right-0 z-20 mt-2 w-60 rounded-xl border border-zinc-200 bg-white p-1.5 shadow-lg">
            {status.name && (
              <div className="mb-1.5 border-b border-zinc-200 px-2.5 pb-2.5 pt-2">
                <p className="truncate text-sm font-semibold text-zinc-800">
                  {status.name}
                </p>
                <p className="text-[12.5px] text-zinc-500">Signed in</p>
              </div>
            )}
            {/* Phones only: the places that leave the bar. */}
            <div className="sm:hidden">
              <Link href="/members" className={menuItem}>
                <svg {...svgProps} className={menuIcon}>
                  <circle cx="6" cy="5.5" r="2.3" />
                  <path d="M1.8 13c.5-2.2 2.2-3.2 4.2-3.2S9.7 10.8 10.2 13M11 3.6a2.3 2.3 0 0 1 0 4.4M12.2 10c1.2.4 2 1.4 2.3 3" />
                </svg>
                Members
              </Link>
              <Link href="/newsletter" className={menuItem}>
                <svg {...svgProps} className={menuIcon}>
                  <path d="M3 3h8v10H4a1 1 0 0 1-1-1V3Zm8 3h2v6a1 1 0 0 1-1 1M5.5 6h3M5.5 8.5h3" />
                </svg>
                Newsletter
              </Link>
              <hr className="my-1.5 border-zinc-200" />
            </div>
            {isEditor && (
              <Link
                href="/admin"
                className={`${menuItem} font-semibold text-brand-navy`}
              >
                <svg {...svgProps} className={menuIcon}>
                  <rect x="2" y="2" width="5" height="5" rx="1" />
                  <rect x="9" y="2" width="5" height="5" rx="1" />
                  <rect x="2" y="9" width="5" height="5" rx="1" />
                  <rect x="9" y="9" width="5" height="5" rx="1" />
                </svg>
                Admin console
              </Link>
            )}
            <Link href="/members/profile" className={menuItem}>
              <svg {...svgProps} className={menuIcon}>
                <circle cx="8" cy="5.5" r="2.5" />
                <path d="M3 13.5c.6-2.4 2.6-3.5 5-3.5s4.4 1.1 5 3.5" />
              </svg>
              User profile
            </Link>
            <Link href="/" className={menuItem}>
              <svg {...svgProps} className={menuIcon}>
                <path d="M2 7.2 8 2l6 5.2V13a1 1 0 0 1-1 1h-3v-4H6v4H3a1 1 0 0 1-1-1V7.2Z" />
              </svg>
              Public site
            </Link>
            <hr className="my-1.5 border-zinc-200" />
            <form action={signOutAction}>
              <button type="submit" className={menuItem}>
                <svg {...svgProps} className={menuIcon}>
                  <path d="M6 2.5H3.5a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1H6M10 5l3 3-3 3M13 8H6" />
                </svg>
                Sign out
              </button>
            </form>
          </div>
        </details>
      ) : (
        <Link
          href="/sign-in"
          data-umami-event="sign-in-click"
          data-umami-event-from="header"
          className="inline-flex min-h-9 items-center rounded-full bg-brand-navy px-4 text-sm font-semibold text-white hover:bg-brand-blue"
        >
          Sign in
        </Link>
      )}
    </div>
  );
}
