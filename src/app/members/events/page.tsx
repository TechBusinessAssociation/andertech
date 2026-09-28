import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { HeroBand } from "@/components/hero-band";
import { getUpcomingEvents, isApprovedMember } from "@/lib/members-db";
import { EventsView } from "./_components/events-view";

type Props = {
  searchParams: Promise<{ cat?: string }>;
};

// Same gate as /members: middleware confirms a session, this re-checks
// the live membership list on every load.
export default async function MemberEventsPage({ searchParams }: Props) {
  const session = await auth();
  const email = session?.user?.email;

  if (!email || !(await isApprovedMember(email))) {
    redirect("/sign-in");
  }

  const params = await searchParams;
  const events = await getUpcomingEvents();

  // Ignore a ?cat= that isn't a real category rather than showing nothing.
  const cat = events.some((event) => event.category === params.cat)
    ? (params.cat ?? null)
    : null;

  return (
    <main className="flex-1">
      <HeroBand labelledBy="events-heading">
        <div className="mx-auto max-w-5xl px-5 py-8 md:py-12">
          <Link
            href="/members"
            className="inline-flex min-h-11 items-center text-sm font-medium text-brand-navy/80 hover:underline dark:text-white/80"
          >
            &larr; Members
          </Link>
          <h1
            id="events-heading"
            className="mt-1 text-4xl font-semibold leading-[1.05] tracking-tight text-balance md:text-5xl"
          >
            Upcoming events
          </h1>
          <p className="mt-3 max-w-[46ch] text-base text-brand-navy/75 md:text-[17px] dark:text-white/75">
            All times Pacific.
            {events.length > 0 && ` ${events.length} coming up.`}
          </p>
        </div>
      </HeroBand>

      <div className="mx-auto max-w-5xl px-5 pb-16 pt-8 md:pt-10">
        <EventsView events={events} cat={cat} />
      </div>
    </main>
  );
}
