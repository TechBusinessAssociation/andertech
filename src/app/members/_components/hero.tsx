import Link from "next/link";
import { daysUntil, formatDay, timeRange } from "@/lib/event-format";
import type { MemberEvent } from "@/lib/members-db";

function countdown(days: number): { big: string; unit: string | null } {
  if (days <= 0) return { big: "Today", unit: null };
  if (days === 1) return { big: "Tomorrow", unit: null };
  return { big: String(days), unit: "days" };
}

// Welcome band: greeting, two shortcuts, and a tile counting down to the next
// event. Airy look -- a light sky-to-cream wash (deep navy in dark mode) with
// a faint network drawing echoing the club's hero artwork.
export function Hero({
  firstName,
  next,
}: {
  firstName: string | null;
  next: MemberEvent | null;
}) {
  const days = next ? countdown(daysUntil(next.event_date)) : null;
  const when = next
    ? [formatDay(next.event_date), next.location].filter(Boolean).join(" · ")
    : null;
  const time = next ? timeRange(next) : null;

  return (
    <section
      aria-labelledby="hello"
      className="relative isolate overflow-hidden bg-linear-to-br from-brand-sky via-white to-brand-cream text-brand-navy dark:from-[#12324f] dark:via-[#0d2136] dark:to-[#2a230f] dark:text-white"
    >
      <svg
        viewBox="0 0 460 300"
        preserveAspectRatio="xMaxYMid slice"
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 -z-10 h-full w-[min(55%,460px)] text-brand-blue/30 dark:text-[#7dbbec]/30"
      >
        <g fill="none" stroke="currentColor" strokeWidth="1">
          <path d="M40 260 L150 120 L290 170 L420 40" />
          <path d="M150 120 L230 30 L420 40" />
          <path d="M290 170 L400 250" />
          <path d="M40 260 L290 170" />
          <circle cx="300" cy="120" r="150" />
          <circle cx="300" cy="120" r="95" />
        </g>
        <g className="fill-brand-gold">
          <circle cx="150" cy="120" r="3.5" />
          <circle cx="290" cy="170" r="3.5" />
          <circle cx="420" cy="40" r="3.5" />
          <circle cx="230" cy="30" r="3" />
        </g>
        <g fill="currentColor">
          <circle cx="40" cy="260" r="3" />
          <circle cx="400" cy="250" r="3" />
        </g>
      </svg>

      <div
        className={`mx-auto grid max-w-5xl items-center gap-6 px-5 py-8 md:py-12 ${
          next ? "md:grid-cols-[1.5fr_1fr] md:gap-10" : ""
        }`}
      >
        <div>
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-brand-navy/70 before:h-0.5 before:w-[22px] before:bg-brand-gold before:content-[''] dark:text-white/70">
            Members
          </span>
          <h1
            id="hello"
            className="mt-3 text-4xl font-semibold leading-[1.05] tracking-tight text-balance md:text-5xl"
          >
            {firstName ? `Welcome back, ${firstName}.` : "Welcome back."}
          </h1>
          <p className="mt-3 max-w-[46ch] text-base text-brand-navy/75 md:text-[17px] dark:text-white/75">
            Events, guides and recruiting resources for AnderTech members, all
            in one place.
          </p>
          <div className="mt-5 flex flex-wrap gap-2.5">
            <Link
              href="/members/events"
              className="inline-flex min-h-11 items-center rounded-[10px] bg-brand-navy px-[18px] text-sm font-semibold text-white hover:bg-brand-blue dark:bg-brand-gold dark:text-brand-navy dark:hover:brightness-105"
            >
              Upcoming events
            </Link>
            <a
              href="#browse"
              className="inline-flex min-h-11 items-center rounded-[10px] border border-brand-blue/30 bg-white/60 px-[18px] text-sm font-semibold text-brand-navy hover:bg-white dark:border-white/20 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
            >
              Search resources
            </a>
          </div>
        </div>

        {next && days && (
          <div
            aria-label="Next event"
            className="grid gap-1 rounded-2xl bg-brand-cream p-5 text-brand-navy shadow-sm"
          >
            <span className="text-xs font-semibold uppercase tracking-[0.1em] opacity-70">
              Next event
            </span>
            <span className="text-[44px] font-semibold leading-none tracking-tighter tabular-nums">
              {days.big}
              {days.unit && (
                <small className="ml-1.5 text-base font-medium tracking-normal opacity-75">
                  {days.unit}
                </small>
              )}
            </span>
            <span className="mt-1.5 font-semibold">{next.title}</span>
            <span className="text-[13px] opacity-75">
              {when}
              {time ? ` · ${time}` : ""}
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
