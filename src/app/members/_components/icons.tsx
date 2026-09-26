import type { ReactNode } from "react";
import type { IconName } from "@/lib/resource-kind";

const paths: Record<IconName, ReactNode> = {
  doc: (
    <>
      <path d="M7 3h7l5 5v13H7z" />
      <path d="M14 3v5h5" />
      <path d="M10 13h6M10 17h6" />
    </>
  ),
  sheet: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M4 10h16M4 15h16M10 4v16" />
    </>
  ),
  form: (
    <>
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <path d="M9 4v2h6V4M9 11h6M9 15h4" />
    </>
  ),
  chart: <path d="M5 20V10M12 20V4M19 20v-7" />,
  video: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="3" />
      <path d="M10 9.5v5l4.5-2.5z" />
    </>
  ),
  slides: (
    <>
      <rect x="3" y="5" width="18" height="12" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </>
  ),
  folder: (
    <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
  ),
  link: (
    <>
      <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" />
      <path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />
    </>
  ),
  arrow: <path d="M7 17 17 7M9 7h8v8" />,
  search: (
    <>
      <circle cx="11" cy="11" r="6" />
      <path d="m20 20-4-4" />
    </>
  ),
  cap: (
    <>
      <path d="M3 9l9-4 9 4-9 4z" />
      <path d="M7 11v5c0 1.5 2.5 3 5 3s5-1.5 5-3v-5" />
    </>
  ),
  brief: (
    <>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M9 7V5h6v2M3 13h18" />
    </>
  ),
  people: (
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M17 14c2.5 0 4 2 4 4.5" />
    </>
  ),
};

export function Icon({
  name,
  className = "h-5 w-5",
}: {
  name: IconName;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`shrink-0 ${className}`}
    >
      {paths[name]}
    </svg>
  );
}

// Soft tinted square behind an icon: blue for documents and media, gold for
// data (sheets, forms, dashboards), matching the two brand tints.
const gold = new Set<IconName>(["sheet", "form", "chart", "brief"]);

export function IconTile({
  name,
  size = "md",
}: {
  name: IconName;
  size?: "sm" | "md";
}) {
  const tone = gold.has(name)
    ? "bg-brand-cream text-amber-700 dark:bg-[#33290f] dark:text-brand-gold"
    : "bg-brand-sky text-brand-blue dark:bg-[#14324d] dark:text-[#7dbbec]";
  const box = size === "sm" ? "h-9 w-9 rounded-[10px]" : "h-11 w-11 rounded-xl";
  const icon = size === "sm" ? "h-[18px] w-[18px]" : "h-[22px] w-[22px]";
  return (
    <span className={`grid shrink-0 place-items-center ${box} ${tone}`}>
      <Icon name={name} className={icon} />
    </span>
  );
}
