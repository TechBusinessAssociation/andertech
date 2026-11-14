import Link from "next/link";
import { daysUntil, formatDay } from "@/lib/event-format";
import type { MemberEvent, MemberProfile } from "@/lib/members-db";

// Events from today through the next six days count as "this week".
const WEEK_DAYS = 7;

// The profile fields counted for "completion", in the order the profile form
// shows them; the tile's caption asks for the first one still empty.
const PROFILE_FIELDS: { key: keyof MemberProfile; label: string }[] = [
  { key: "displayName", label: "display name" },
  { key: "gradYear", label: "graduation year" },
  { key: "program", label: "program" },
  { key: "linkedinUrl", label: "LinkedIn" },
];

const tileClass =
  "flex min-h-[108px] flex-col rounded-2xl bg-brand-sky/70 p-4 transition hover:bg-brand-sky motion-reduce:transition-none dark:bg-white/5 dark:hover:bg-white/10";
const labelClass = "text-sm text-zinc-600 dark:text-zinc-400";
const valueClass =
  "mt-1 text-[30px] leading-tight tracking-tight text-brand-navy tabular-nums dark:text-white";
const unitClass =
  "ml-1.5 text-base tracking-normal text-zinc-600 dark:text-zinc-400";
const captionClass = "mt-auto pt-2 text-sm text-zinc-600 dark:text-zinc-400";
const actionClass =
  "mt-auto pt-2 text-sm font-semibold text-[#2c6597] dark:text-[#7dbbec]";

// Two tiles under the welcome band: events in the next 7 days (LA time, from
// the same upcoming list the rest of the page uses) and how much of the
// member's own profile is filled in. Both are links: to /members/events and
// to /members/profile.
export function AtAGlance({
  events,
  profile,
}: {
  events: MemberEvent[];
  profile: MemberProfile;
}) {
  const thisWeek = events.filter(
    (event) => daysUntil(event.event_date) < WEEK_DAYS,
  );
  const next = events[0] ?? null;
  const eventsCaption = next
    ? `${thisWeek.length > 0 ? "Next" : "Next one"}: ${next.title}, ${formatDay(next.event_date)}`
    : "Nothing scheduled yet";

  const filled = PROFILE_FIELDS.filter(({ key }) => {
    const value = profile[key];
    return typeof value === "string" ? value.trim() !== "" : value !== null;
  }).length;
  const missing = PROFILE_FIELDS.find(({ key }) => {
    const value = profile[key];
    return typeof value === "string" ? value.trim() === "" : value === null;
  });

  return (
    <section
      aria-label="At a glance"
      className="grid grid-cols-2 gap-3 pt-8 md:pt-10"
    >
      <Link href="/members/events" className={tileClass}>
        <span className={labelClass}>Events in the next 7 days</span>
        <span className={valueClass}>{thisWeek.length}</span>
        <span className={`${captionClass} line-clamp-2`}>{eventsCaption}</span>
      </Link>
      <Link href="/members/profile" className={tileClass}>
        <span className={labelClass}>Your profile</span>
        <span className={valueClass}>
          {filled}
          <span className={unitClass}>of {PROFILE_FIELDS.length} filled</span>
        </span>
        <span className={missing ? actionClass : captionClass}>
          {missing ? `Add your ${missing.label}` : "All set. Edit profile"}
        </span>
      </Link>
    </section>
  );
}
