import { HeroBand } from "@/components/hero-band";
import { IconTile } from "@/components/icons";
import { links } from "../../content/links";
import { site } from "../../content/site";

const socialLinks = [
  { label: "Instagram", href: links.instagram },
  { label: "Facebook", href: links.facebook },
  { label: "LinkedIn", href: links.linkedin },
] as const;

// Landing page hero: club name, tagline, contact and social links, and the
// three things the club does. There is deliberately no "Join" button for now
// (links.joinSurvey stays in content/links.ts, unused, for when it returns).
// All text comes from /content so the board can edit it without touching code.
export function LandingHero() {
  const activeSocials = socialLinks.filter((link) => link.href);

  return (
    <HeroBand labelledBy="home-heading">
      <div className="mx-auto grid max-w-5xl items-center gap-8 px-5 py-10 md:grid-cols-[1.35fr_1fr] md:gap-12 md:py-14">
        <div>
          {site.officialName && (
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-brand-navy/70 before:h-0.5 before:w-[22px] before:shrink-0 before:bg-brand-gold before:content-[''] dark:text-white/70">
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

          {(site.contactEmail || activeSocials.length > 0) && (
            <div className="mt-6 flex flex-wrap items-center gap-2.5">
              {site.contactEmail && (
                <a
                  href={`mailto:${site.contactEmail}`}
                  className="inline-flex min-h-11 items-center rounded-[10px] bg-brand-navy px-[18px] text-sm font-semibold text-white hover:bg-brand-blue dark:bg-brand-gold dark:text-brand-navy dark:hover:brightness-105"
                >
                  Contact us
                </a>
              )}
              {activeSocials.map((link) => (
                <a
                  key={link.label}
                  href={link.href!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center rounded-[10px] border border-brand-blue/30 bg-white/60 px-[18px] text-sm font-semibold text-brand-navy hover:bg-white dark:border-white/20 dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
                >
                  {link.label}
                </a>
              ))}
            </div>
          )}
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
