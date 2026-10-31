import { BoardSection } from "@/components/board-section";
import { ConferencesSection } from "@/components/home/conferences-section";
import { HomeHero } from "@/components/home/home-hero";
import { MembersSection } from "@/components/home/members-section";
import { PillarsSection } from "@/components/home/pillars-section";
import { Wrap, displayFont } from "@/components/home/ui";
import { YearSection } from "@/components/home/year-section";
import { SiteFooter } from "@/components/site-footer";

// Public landing page: hero with the numbers strip, "A year in the club"
// photos, the three pillars, the flagship conferences with the events slot,
// the members pitch, the board, and a footer. It reads no session and no
// database, so it is prerendered and served from the CDN -- keep it that way
// (see src/components/header.tsx). All text and links come from /content so
// the board can edit them without touching code.
export default function Home() {
  return (
    <main className={`${displayFont.variable} flex-1`}>
      <HomeHero />
      <YearSection />
      <PillarsSection />
      <ConferencesSection />
      <MembersSection />
      <Wrap>
        <BoardSection />
      </Wrap>
      <SiteFooter />
    </main>
  );
}
