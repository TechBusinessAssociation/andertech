"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// The only client component in /admin: it needs the current path to mark the
// active item. On phones the menu becomes a scrollable row across the top.
const linkBase =
  "whitespace-nowrap rounded-lg px-3 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800";

type Item = { href: string; label: string; badge?: "requests" };

// Full admins see everything; editors see only their own sections:
// newsletter editors the Newsletter item, recruiting editors Categories and
// Resources (not the dashboard link, which stays admin-only).

const NEWSLETTER = "/admin/newsletter";
const RECRUITING_EDITOR_ITEMS = ["/admin/categories", "/admin/resources"];

type Entry = Item | { group: string; items: Item[] };

const items: Entry[] = [
  { href: "/admin/members", label: "Members" },
  { href: "/admin/requests", label: "Requests", badge: "requests" },
  {
    group: "Resources",
    items: [
      { href: "/admin/categories", label: "Categories" },
      { href: "/admin/resources", label: "Resources" },
      { href: "/admin/recruiting", label: "Recruiting dashboard" },
    ],
  },
  { href: "/admin/events", label: "Events" },
  { href: NEWSLETTER, label: "Newsletter" },
];

export function AdminNav({
  pendingRequests,
  admin,
  newsletter,
  recruiting,
}: {
  pendingRequests: number;
  admin: boolean;
  newsletter: boolean;
  recruiting: boolean;
}) {
  const pathname = usePathname();
  const allowed = (href: string) =>
    (newsletter && href === NEWSLETTER) ||
    (recruiting && RECRUITING_EDITOR_ITEMS.includes(href));
  const visible = admin
    ? items
    : items.flatMap((item): Entry[] => {
        if ("href" in item) return allowed(item.href) ? [item] : [];
        const children = item.items.filter((child) => allowed(child.href));
        return children.length > 0 ? [{ ...item, items: children }] : [];
      });

  function NavLink({
    href,
    label,
    badge,
    indent,
  }: Item & { indent?: boolean }) {
    const active = pathname === href || pathname.startsWith(`${href}/`);
    const count = badge === "requests" ? pendingRequests : 0;
    return (
      <Link
        href={href}
        aria-current={active ? "page" : undefined}
        className={`${linkBase} ${indent ? "md:ml-3" : ""} ${
          active
            ? "bg-zinc-100 font-semibold text-brand-navy dark:bg-zinc-800 dark:text-white"
            : "text-zinc-700 dark:text-zinc-300"
        }`}
      >
        {label}
        {count > 0 && (
          <span
            aria-label={`${count} pending`}
            className="ml-2 inline-flex min-w-5 items-center justify-center rounded-full bg-brand-gold px-1.5 text-xs font-semibold text-brand-navy"
          >
            {count}
          </span>
        )}
      </Link>
    );
  }

  return (
    <nav
      aria-label="Admin"
      className="-mx-1 flex gap-1 overflow-x-auto px-1 md:mx-0 md:flex-col md:overflow-visible md:px-0"
    >
      {visible.map((item) =>
        "group" in item ? (
          <div
            key={item.group}
            className="flex gap-1 md:flex-col md:gap-0"
          >
            <span className="hidden px-3 pb-1 pt-3 text-xs font-semibold uppercase tracking-wide text-zinc-500 md:block">
              {item.group}
            </span>
            {item.items.map((child) => (
              <NavLink key={child.href} {...child} indent />
            ))}
          </div>
        ) : (
          <NavLink key={item.href} {...item} />
        ),
      )}
    </nav>
  );
}
