import Image from "next/image";
import { SectionHeading, SectionLabel, Wrap } from "@/components/home/ui";
import { pillarsIntro } from "../../../content/home";
import { chapters } from "../../../content/programs";
import { site } from "../../../content/site";

// "What we do": three pillar cards; picking one shows its photo, text and
// programs below. The picking is three hidden radio buttons and CSS (:has(),
// see .pillars in globals.css), so it works without JavaScript and the home
// page stays static. Radios give keyboard users the arrow keys for free. The
// panels are all in the HTML, only the picked one is displayed.
// Copy: content/home.ts (intro) and content/programs.ts (pillars, programs).
export function PillarsSection() {
  return (
    <section
      id="what-we-do"
      aria-labelledby="pillars-heading"
      className="scroll-mt-16 py-16 md:py-[120px]"
    >
      <Wrap>
        <SectionLabel>{pillarsIntro.label}</SectionLabel>
        <SectionHeading id="pillars-heading" className="max-w-[16ch]">
          {pillarsIntro.heading}
        </SectionHeading>
        <p className="mt-5 max-w-[52ch] text-lg text-brand-navy/70 dark:text-white/70">
          {pillarsIntro.lede}
        </p>

        <div className="pillars">
          <fieldset className="mt-9 border-0 p-0 md:mt-14">
            <legend className="sr-only">Choose a pillar</legend>
            {chapters.map((chapter, i) => (
              <input
                key={chapter.id}
                type="radio"
                name="pillar"
                id={`pillar-${i}`}
                defaultChecked={i === 0}
                className="sr-only"
              />
            ))}
            <div className="grid gap-2.5 md:grid-cols-3 md:gap-3.5">
              {chapters.map((chapter, i) => (
                <label
                  key={chapter.id}
                  htmlFor={`pillar-${i}`}
                  className="pillar-tab block cursor-pointer rounded-[22px] border-[1.5px] border-brand-navy/15 p-5 md:px-[26px] md:pb-[26px] md:pt-6 dark:border-white/20"
                >
                  <span className="pillar-num block font-mono text-xs font-medium uppercase tracking-[0.14em]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="mt-3 block font-display text-[23px] font-bold leading-[1.12] tracking-[-0.035em] md:text-[25px]">
                    {chapter.label}
                  </span>
                  <span className="pillar-blurb mt-2.5 block text-[14.5px] leading-normal">
                    {site.pillars[i]?.blurb}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          {chapters.map((chapter, i) => (
            <div
              key={chapter.id}
              id={chapter.id}
              className={`pillar-panel pillar-panel-${i} mt-5 scroll-mt-16 overflow-hidden rounded-3xl bg-brand-sky md:rounded-[32px] dark:bg-white/[0.06]`}
            >
              <div className="relative h-[200px] w-full bg-brand-navy md:h-[320px]">
                {chapter.photo ? (
                  <Image
                    src={chapter.photo.src}
                    alt={chapter.photo.alt}
                    fill
                    sizes="(min-width: 1200px) 1120px, 100vw"
                    className="object-cover"
                  />
                ) : (
                  <div
                    role="img"
                    aria-label={`Pillar ${i + 1}`}
                    className="flex h-full items-center px-6 md:px-14"
                  >
                    <span className="font-display text-[100px] font-bold leading-[0.78] tracking-[-0.035em] text-brand-gold md:text-[170px]">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                )}
              </div>
              <div className="px-[22px] pb-9 pt-7 md:px-14 md:pb-14 md:pt-12">
                <div className="grid gap-4 md:grid-cols-2 md:items-end md:gap-12">
                  <div>
                    <SectionLabel>{chapter.label}</SectionLabel>
                    <h3 className="mt-3.5 max-w-[18ch] font-display text-[30px] font-bold leading-[1.04] tracking-[-0.035em] md:text-[42px]">
                      {chapter.heading}
                    </h3>
                  </div>
                  <p className="max-w-[50ch] text-[17px] leading-relaxed text-brand-navy/80 dark:text-white/80">
                    {chapter.body}
                  </p>
                </div>
                <ul className="mt-8 grid gap-6 border-t-[1.5px] border-brand-navy/15 pt-7 md:mt-11 md:grid-cols-3 md:gap-x-10 md:gap-y-8 md:pt-10 dark:border-white/20">
                  {chapter.programs.map((program) => (
                    <li key={program.title}>
                      <h4 className="text-base font-semibold leading-snug">
                        {program.title}
                      </h4>
                      <p className="mt-2 text-[14.5px] leading-normal text-brand-navy/70 dark:text-white/70">
                        {program.blurb}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </Wrap>
    </section>
  );
}
