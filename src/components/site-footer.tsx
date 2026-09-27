import { FlipButton } from "@/components/flip-button";
import { links } from "../../content/links";
import { site } from "../../content/site";

// Contact + social links, moved to the bottom of the public landing page
// (they used to sit in the hero -- see landing-hero.tsx). Same FlipButton
// component and behavior as before, just relocated.
const socialLinks = [
  { label: "Instagram", icon: "instagram", href: links.instagram },
  { label: "Facebook", icon: "facebook", href: links.facebook },
  { label: "LinkedIn", icon: "linkedin", href: links.linkedin },
] as const;

export function SiteFooter() {
  const activeSocials = socialLinks.filter((link) => link.href);
  if (!site.contactEmail && activeSocials.length === 0) return null;

  return (
    <footer className="border-t border-zinc-200 py-8 dark:border-zinc-800">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-5 sm:flex-row sm:justify-between">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {site.name}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          {site.contactEmail && (
            <FlipButton
              href={`mailto:${site.contactEmail}`}
              icon="mail"
              label="Contact us"
            />
          )}
          {activeSocials.map((link) => (
            <FlipButton
              key={link.label}
              href={link.href!}
              icon={link.icon}
              label={link.label}
              external
            />
          ))}
        </div>
      </div>
    </footer>
  );
}
