import Image from "next/image";
import { MembershipCta } from "@/components/membership-cta";
import { Wrap } from "@/components/home/ui";
import { hero, stats } from "../../../content/home";
import { site } from "../../../content/site";

// Landing hero: navy band with the mixer photo fading in from the right, the
// headline, the "Become a member" dues dropdown, and the numbers strip. The
// band is navy in light and dark mode alike, like the header's white plate.
// All text comes from /content.
export function HomeHero() {
  return (
    <section
      id="top"
      aria-labelledby="home-heading"
      className="relative bg-brand-navy text-white"
    >
      <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-y-0 right-0 w-full opacity-50 md:w-[70%] md:opacity-100">
          <Image
            src={hero.photo.src}
            alt={hero.photo.alt}
            fill
            priority
            sizes="(min-width: 768px) 70vw, 100vw"
            className="object-cover object-[62%_55%]"
          />
        </div>
        {/* Fade the photo into the navy so the headline stays readable. */}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(15_43_70/0.5)_0%,#0f2b46_78%)] md:hidden" />
        <div className="absolute inset-0 hidden bg-[linear-gradient(90deg,#0f2b46_0%,#0f2b46_32%,rgb(15_43_70/0.8)_50%,rgb(15_43_70/0.22)_100%),linear-gradient(0deg,#0f2b46_0%,rgb(15_43_70/0)_34%)] md:block" />
      </div>

      <Wrap className="relative pb-12 pt-14 md:pb-[88px] md:pt-[104px]">
        {site.officialName && (
          <p className="font-mono text-xs font-medium uppercase tracking-[0.14em] text-[#9cc6ea]">
            {site.officialName}
          </p>
        )}
        <h1
          id="home-heading"
          className="mt-5 max-w-[780px] font-display text-[46px] font-bold leading-[0.98] tracking-[-0.035em] text-balance md:mt-7 md:text-[84px]"
        >
          {hero.lead}
          <span className="text-brand-gold">{hero.highlight}</span>
        </h1>
        <p className="mt-5 max-w-[520px] text-[17px] leading-normal text-white/80 md:mt-7 md:text-xl">
          {site.tagline}
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3.5 md:mt-10">
          <MembershipCta variant="hero" />
          <a
            href="#what-we-do"
            className="inline-flex min-h-12 items-center justify-center rounded-full border-[1.5px] border-white/40 px-6 text-[15px] font-semibold text-white hover:border-white hover:bg-white/10"
          >
            See what we do
          </a>
        </div>
      </Wrap>

      <Wrap className="relative">
        <ul className="grid grid-cols-3 border-t border-white/15">
          {stats.map((stat, i) => (
            <li
              key={stat.label}
              className={`py-5 pr-2 md:py-7 md:pb-9 md:pr-6 ${
                i > 0 ? "border-l border-white/10 pl-3 md:pl-6" : ""
              }`}
            >
              <p className="font-display text-[32px] font-bold leading-none tracking-[-0.035em] md:text-[52px]">
                {stat.value}
              </p>
              <p className="mt-2.5 max-w-[20ch] text-[13px] text-white/70 md:text-sm">
                {stat.label}
              </p>
            </li>
          ))}
        </ul>
      </Wrap>
    </section>
  );
}
