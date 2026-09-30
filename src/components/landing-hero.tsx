import { HeroBand } from "@/components/hero-band";
import { IconTile } from "@/components/icons";
import { MembershipCta } from "@/components/membership-cta";
import { site } from "../../content/site";

// Landing page hero: club name, tagline, the three things the club does, and
// the "Become a member" CTA (src/components/membership-cta.tsx) -- dues are
// now paid through Crowded, which replaces the old "Join" Google Form button
// (links.joinSurvey in content/links.ts is retired, kept only for reference).
// Contact/social links live in the footer now
// (src/components/site-footer.tsx). All text comes from /content so the
// board can edit it without touching code.
export function LandingHero() {
  return (
    <HeroBand labelledBy="home-heading">
      <div className="mx-auto grid max-w-5xl items-center gap-8 px-5 py-10 md:grid-cols-[1.35fr_1fr] md:gap-12 md:py-14">
        <div>
          {site.officialName && (
            <span className="inline-flex items-center text-xs font-semibold uppercase tracking-[0.12em] text-brand-navy/70 dark:text-white/70">
              {site.officialName}
            </span>
          )}
          <h1
            id="home-heading"
            className="mt-3 text-5xl font-semibold leading-[1.02] tracking-tight text-balance md:text-6xl"
          >
            {site.name}
          </h1>
          <p className="mt-4 max-w-[46ch] text-lg text-brand-navy/80 md:text-xl dark:text-white/80">
            {site.tagline}
          </p>
          {site.description && (
            <p className="mt-3 max-w-[52ch] text-base text-brand-navy/70 dark:text-white/70">
              {site.description}
            </p>
          )}

          <div className="mt-6">
            <MembershipCta />
          </div>
        </div>

        {site.pillars.length > 0 && (
          <ul className="grid gap-3" aria-label="What AnderTech does">
            {site.pillars.map((pillar) => (
              <li
                key={pillar.title}
                className="flex items-center gap-3.5 rounded-2xl border border-white/70 bg-white/70 p-4 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-white/5"
              >
                <IconTile name={pillar.icon} />
                <div className="min-w-0">
                  <p className="font-semibold tracking-tight">{pillar.title}</p>
                  <p className="text-[13px] text-brand-navy/70 dark:text-white/70">
                    {pillar.blurb}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </HeroBand>
  );
}
