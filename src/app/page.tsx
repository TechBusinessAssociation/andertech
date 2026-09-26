import { BoardSection } from "@/components/board-section";
import { EventsSection } from "@/components/events-section";
import { FeaturedEvent } from "@/components/featured-event";
import { LandingHero } from "@/components/landing-hero";
import { WhatWeDoSection } from "@/components/what-we-do-section";

// Public landing page: hero (name, tagline, the three pillars, contact/
// social), the featured "Coming up" event, the "What we do" chapters, board,
// events. It reads no session, so it is prerendered and served from the CDN
// -- keep it that way (see src/components/header.tsx). All text and links
// come from /content so the board can edit them without touching code.
export default function Home() {
  return (
    <main className="flex-1">
      <LandingHero />
      <FeaturedEvent />
      <WhatWeDoSection />
      <div className="mx-auto max-w-5xl px-5">
        <BoardSection />
        <EventsSection />
      </div>
    </main>
  );
}
