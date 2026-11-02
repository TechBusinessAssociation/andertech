import Link from "next/link";
import { Logo } from "@/components/logo";
import { Wrap } from "@/components/home/ui";
import { footerStatement } from "../../content/home";
import { links } from "../../content/links";
import { site } from "../../content/site";

// Footer of the public landing page: logo on a white plate (like the header),
// the one-line statement, and Contact / Follow / Members columns. A link with
// no URL in content/links.ts (or no contact email in content/site.ts) is
// simply left out. The icon "flip buttons" that used to live here are retired
// on this page (src/components/flip-button.tsx is still in the repo).
const socialLinks = [
  { label: "Instagram", href: links.instagram },
  { label: "Facebook", href: links.facebook },
  { label: "LinkedIn", href: links.linkedin },
];

const columnHeading =
  "mb-4 font-mono text-xs font-medium uppercase tracking-[0.14em] text-[#9cc6ea]";
const linkClass = "text-[15px] text-white/85 hover:text-brand-gold";

export function SiteFooter() {
  const activeSocials = socialLinks.filter((link) => link.href);

  return (
    <footer data-section="footer" className="bg-brand-navy pb-10 pt-14 text-white md:pt-[88px]">
      <Wrap>
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-[6fr_2fr_2fr_2fr]">
          <div className="sm:col-span-2 md:col-span-1">
            <span className="inline-block rounded-[14px] bg-white px-[18px] py-3">
              <Logo className="h-[38px] w-auto" />
            </span>
            <p className="mt-8 max-w-[14ch] font-display text-[34px] font-bold leading-[1.02] tracking-[-0.035em] md:text-[44px]">
              {footerStatement}
            </p>
          </div>

          {site.contactEmail && (
            <div>
              <h2 className={columnHeading}>Contact</h2>
              <ul>
                <li>
                  <a href={`mailto:${site.contactEmail}`} className={linkClass}>
                    Email the board
                  </a>
                </li>
              </ul>
            </div>
          )}

          {activeSocials.length > 0 && (
            <div>
              <h2 className={columnHeading}>Follow</h2>
              <ul className="grid gap-2.5">
                {activeSocials.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={linkClass}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <h2 className={columnHeading}>Members</h2>
            <ul className="grid gap-2.5">
              <li>
                <Link href="/newsletter" className={linkClass}>
                  Newsletter
                </Link>
              </li>
              <li>
                <Link
                  href="/sign-in"
                  data-umami-event="sign-in-click"
                  data-umami-event-from="footer"
                  className={linkClass}
                >
                  Sign in
                </Link>
              </li>
              <li>
                <Link
                  href="/request-access"
                  data-umami-event="request-access-click"
                  data-umami-event-from="footer"
                  className={linkClass}
                >
                  Request access
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-wrap justify-between gap-3 border-t border-white/15 pt-6 text-[13px] text-white/60 md:mt-[72px]">
          <span>
            {site.officialName}, UCLA Anderson School of Management
          </span>
          {site.contactEmail && <span>{site.contactEmail}</span>}
        </div>
      </Wrap>
    </footer>
  );
}
