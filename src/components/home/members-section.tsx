import Link from "next/link";
import { SectionHeading, SectionLabel, Wrap } from "@/components/home/ui";
import { membersSection } from "../../../content/home";
import { membership } from "../../../content/membership";

// The public pitch for the members-only area: what is behind sign-in, the
// dues links (Crowded, same terms as the hero's dropdown; hidden if none has
// a URL, content/membership.ts), and sign-in / request-access buttons. The
// card on the right is an illustration (content/home.ts), never real data.
export function MembersSection() {
  const terms = membership.terms.filter(
    (term): term is { label: string; url: string } => Boolean(term.url),
  );
  const { preview } = membersSection;

  return (
    <section
      id="members"
      data-section="members"
      aria-labelledby="members-heading"
      className="scroll-mt-16 bg-brand-cream py-16 md:py-[120px] dark:bg-[#33290f]"
    >
      <Wrap className="grid items-center gap-10 md:grid-cols-2 md:gap-[72px]">
        <div>
          <SectionLabel>{membersSection.label}</SectionLabel>
          <SectionHeading id="members-heading" className="max-w-[15ch]">
            {membersSection.heading}
          </SectionHeading>
          <p className="mt-5 max-w-[52ch] text-lg text-brand-navy/70 dark:text-white/70">
            {membersSection.lede}
          </p>

          {terms.length > 0 && (
            <>
              <p className="mt-8 font-mono text-xs font-medium uppercase tracking-[0.14em] text-brand-navy/70 dark:text-white/70">
                Pay dues through Crowded
              </p>
              <ul className="mt-3.5 flex flex-wrap gap-2.5">
                {terms.map((term) => (
                  <li key={term.label}>
                    <a
                      href={term.url}
                      data-umami-event="payment-link-click"
                      data-umami-event-term={term.label}
                      data-umami-event-from="members-section"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-11 items-center rounded-full border-[1.5px] border-brand-navy/20 bg-white px-[18px] text-[15px] font-medium text-brand-navy hover:border-brand-navy hover:bg-brand-navy hover:text-white dark:border-white/20 dark:bg-zinc-900 dark:text-white dark:hover:bg-white dark:hover:text-brand-navy"
                    >
                      {term.label}
                    </a>
                  </li>
                ))}
              </ul>
            </>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/sign-in"
              data-umami-event="sign-in-click"
              data-umami-event-from="members-section"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-brand-navy px-6 text-[15px] font-semibold text-white hover:bg-brand-blue dark:bg-brand-gold dark:text-brand-navy dark:hover:brightness-105"
            >
              Sign in
            </Link>
            <Link
              href="/request-access"
              data-umami-event="request-access-click"
              data-umami-event-from="members-section"
              className="inline-flex min-h-12 items-center justify-center rounded-full border-[1.5px] border-brand-navy/25 bg-white px-6 text-[15px] font-semibold text-brand-navy hover:border-brand-navy dark:border-white/25 dark:bg-transparent dark:text-white dark:hover:border-white"
            >
              Request access
            </Link>
          </div>
        </div>

        <div>
          <div
            role="img"
            aria-label={preview.alt}
            className="rounded-3xl border border-brand-navy/10 bg-white p-4 shadow-[0_30px_70px_rgb(15_43_70/0.16)] md:rounded-[32px] md:p-6 dark:border-white/10 dark:bg-zinc-900 dark:shadow-none"
          >
            <div aria-hidden="true">
              <div className="flex flex-wrap gap-2">
                {preview.tabs.map((tab, i) => (
                  <span
                    key={tab}
                    className={`rounded-full px-3.5 py-[9px] text-[13px] font-medium ${
                      i === 0
                        ? "bg-brand-navy text-white dark:bg-brand-gold dark:text-brand-navy"
                        : "bg-brand-sky text-brand-navy/80 dark:bg-white/10 dark:text-white/80"
                    }`}
                  >
                    {tab}
                  </span>
                ))}
              </div>
              <div className="mt-4 rounded-2xl bg-brand-navy p-5 text-white">
                <p className="font-mono text-xs font-medium uppercase tracking-[0.14em] text-[#9cc6ea]">
                  {preview.pinnedLabel}
                </p>
                <p className="mt-1.5 font-display text-2xl font-bold tracking-[-0.035em]">
                  {preview.pinnedTitle}
                </p>
              </div>
              <div className="mt-5 grid gap-2.5">
                {preview.rows.map((row) => (
                  <div
                    key={row}
                    className="flex items-center justify-between rounded-2xl border-[1.5px] border-brand-navy/10 px-5 py-[18px] font-semibold dark:border-white/15"
                  >
                    {row}
                    <span className="text-[13px] font-medium text-brand-blue dark:text-[#9cc6ea]">
                      Open →
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <p className="mt-4 text-center font-mono text-xs font-medium uppercase tracking-[0.14em] text-brand-navy/60 dark:text-white/60">
            {preview.note}
          </p>
        </div>
      </Wrap>
    </section>
  );
}
