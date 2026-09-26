import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import {
  getFeaturedResources,
  getResourceGroups,
  getUpcomingEvents,
  isApprovedMember,
} from "@/lib/members-db";
import { site } from "../../../content/site";
import { Browse } from "./_components/browse";
import { FooterCards } from "./_components/footer-cards";
import { Hero } from "./_components/hero";
import { NextUp } from "./_components/next-up";
import { StartHere } from "./_components/start-here";

type Props = {
  searchParams: Promise<{ q?: string; cat?: string }>;
};

// middleware.ts only confirms a signed-in Google session (Edge-safe,
// cheap check) -- database access stays out of that bundle on purpose
// (see auth.config.ts and middleware.ts's comments). So the actual live
// membership re-check happens here instead, on every load of this page
// (Node.js runtime, unaffected).
export default async function MembersPage({ searchParams }: Props) {
  const session = await auth();
  const email = session?.user?.email;

  if (!email || !(await isApprovedMember(email))) {
    redirect("/sign-in");
  }

  const params = await searchParams;
  const [groups, featured, events] = await Promise.all([
    getResourceGroups(),
    getFeaturedResources(),
    getUpcomingEvents(),
  ]);

  const q = (params.q ?? "").slice(0, 100);
  // Ignore a ?cat= that isn't a real category rather than showing nothing.
  const cat = groups.some((group) => group.name === params.cat)
    ? (params.cat ?? null)
    : null;
  const firstName = session?.user?.name?.trim().split(/\s+/)[0] || null;

  return (
    <main className="flex-1">
      <Hero firstName={firstName} next={events[0] ?? null} />

      <div className="mx-auto max-w-5xl px-5">
        <NextUp events={events} />
        <StartHere resources={featured} />
        <Browse groups={groups} q={q} cat={cat} />
        <FooterCards
          contactEmail={site.contactEmail}
          subjectPrefix={site.feedbackSubject}
        />

        <form
          className="pb-10 text-center"
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <button
            type="submit"
            className="min-h-11 text-sm text-zinc-600 underline hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            Sign out
          </button>
        </form>
      </div>
    </main>
  );
}
