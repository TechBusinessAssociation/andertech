import { redirect } from "next/navigation";
import { auth } from "@/auth";
import {
  getAnnouncements,
  getDirectoryMembers,
  getFeaturedResources,
  getMemberProfile,
  getRecruitingPage,
  getResourceGroups,
  getShowcasePosts,
  getUpcomingEvents,
  isApprovedMember,
} from "@/lib/members-db";
import { site } from "../../../content/site";
import { Browse } from "./_components/browse";
import { FooterCards } from "./_components/footer-cards";
import { Hero } from "./_components/hero";
import { isTabKey, MemberTabs, type TabKey } from "./_components/member-tabs";
import { NextUp } from "./_components/next-up";
import { StartHere } from "./_components/start-here";

type Props = {
  searchParams: Promise<{ q?: string; cat?: string; tab?: string; dq?: string }>;
};

// Only the active tab's data is ever fetched -- the other three tabs' DB
// queries never run on a given page load. See member-tabs.tsx.
async function loadTab(tab: TabKey, dq: string) {
  switch (tab) {
    case "whats-new":
      return { tab, announcements: await getAnnouncements() } as const;
    case "directory":
      return { tab, members: await getDirectoryMembers(), dq } as const;
    case "showcase":
      return { tab, posts: await getShowcasePosts() } as const;
    case "recruiting":
    default:
      return { tab: "recruiting" as const, recruiting: await getRecruitingPage() };
  }
}

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
  const [groups, featured, events, profile] = await Promise.all([
    getResourceGroups(),
    getFeaturedResources(),
    getUpcomingEvents(),
    getMemberProfile(email),
  ]);

  const q = (params.q ?? "").slice(0, 100);
  // Ignore a ?cat= that isn't a real category rather than showing nothing.
  const cat = groups.some((group) => group.name === params.cat)
    ? (params.cat ?? null)
    : null;
  // The member's own display name (set on /members/profile) wins over their
  // Google account name, so the greeting doesn't reveal a legal/full name
  // someone didn't choose to share.
  const firstName =
    profile.displayName?.trim().split(/\s+/)[0] ||
    session?.user?.name?.trim().split(/\s+/)[0] ||
    null;

  const tab: TabKey = isTabKey(params.tab) ? params.tab : "recruiting";
  const dq = (params.dq ?? "").slice(0, 100);
  const tabData = await loadTab(tab, dq);

  return (
    <main className="flex-1">
      <Hero firstName={firstName} next={events[0] ?? null} />

      <div className="mx-auto max-w-5xl px-5 pb-10">
        <MemberTabs {...tabData} />
        <NextUp events={events} />
        <StartHere resources={featured} />
        <Browse groups={groups} q={q} cat={cat} />
        <FooterCards
          contactEmail={site.contactEmail}
          subjectPrefix={site.feedbackSubject}
        />
      </div>
    </main>
  );
}
