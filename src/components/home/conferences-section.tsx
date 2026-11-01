import { EventsSection } from "@/components/events-section";
import { SectionHeading, SectionLabel, Wrap } from "@/components/home/ui";
import { conferences } from "../../../content/home";

// The flagship conferences (copy in content/home.ts), with the events
// calendar slot under them (src/components/events-section.tsx).
export function ConferencesSection() {
  return (
    <section
      id="conferences"
      data-section="conferences"
      aria-labelledby="conferences-heading"
      className="scroll-mt-16 bg-brand-sky py-16 md:py-[120px] dark:bg-white/[0.04]"
    >
      <Wrap>
        <SectionLabel>Flagship conferences</SectionLabel>
        <SectionHeading id="conferences-heading" className="max-w-[18ch]">
          Three big days a year, one each quarter.
        </SectionHeading>

        <div className="mt-9 grid gap-6 md:mt-14 md:grid-cols-2 lg:grid-cols-3">
          {conferences.map((conference) => (
            <article
              key={conference.title}
              className="relative flex flex-col gap-5 overflow-hidden rounded-3xl bg-brand-navy p-7 text-white md:min-h-[420px] md:rounded-[32px] md:p-9 lg:p-8"
            >
              <div
                aria-hidden="true"
                className="absolute -right-[90px] -top-[90px] size-[300px] rounded-full border-[1.5px] border-brand-gold/45 shadow-[0_0_0_40px_rgb(243_185_71/0.05),0_0_0_90px_rgb(243_185_71/0.04)]"
              />
              <p className="relative z-10 w-fit rounded-full bg-brand-gold px-3.5 py-[7px] font-mono text-xs font-medium uppercase tracking-[0.14em] text-brand-navy">
                {conference.season}
              </p>
              <h3 className="relative z-10 max-w-[14ch] font-display text-4xl font-bold leading-none tracking-[-0.035em] md:text-[40px] lg:text-[34px]">
                {conference.title}
              </h3>
              {conference.theme && (
                <div>
                  <p className="mt-2 font-mono text-xs font-medium uppercase tracking-[0.14em] text-[#9cc6ea]">
                    {conference.theme.label}
                  </p>
                  <p className="mt-2 max-w-[34ch] text-[19px] leading-snug">
                    {conference.theme.text}
                  </p>
                </div>
              )}
              <p className="max-w-[42ch] text-base text-white/80">
                {conference.copy}
              </p>
              <p className="mt-auto border-t border-white/15 pt-4 font-mono text-xs font-medium uppercase tracking-[0.14em] text-[#9cc6ea]">
                {conference.with}
              </p>
            </article>
          ))}
        </div>

        <EventsSection />
      </Wrap>
    </section>
  );
}
