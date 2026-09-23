import { site } from "../../content/site";
import { links } from "../../content/links";
import { BoardSection } from "@/components/board-section";
import { EventsSection } from "@/components/events-section";

const socialLinks = [
  { label: "Instagram", href: links.instagram },
  { label: "Facebook", href: links.facebook },
  { label: "LinkedIn", href: links.linkedin },
] as const;

// Phase 1 landing page: hero (name, tagline, join, contact/social), board
// section, events section. All text/links come from /content so the board
// can edit them without touching this file.
export default function Home() {
  const activeSocialLinks = socialLinks.filter((link) => link.href);

  return (
    <main className="flex-1">
      <section className="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-16">
        <h1 className="text-4xl font-semibold tracking-tight">{site.name}</h1>
        {site.officialName && (
          <p className="text-lg text-zinc-700 dark:text-zinc-300">
            {site.officialName}
          </p>
        )}
        <p className="text-xl text-zinc-700 dark:text-zinc-300">{site.tagline}</p>
        {site.description && (
          <p className="text-zinc-600 dark:text-zinc-400">{site.description}</p>
        )}

        {links.joinSurvey ? (
          <a
            href={links.joinSurvey}
            className="inline-flex min-h-12 w-fit items-center rounded-lg bg-brand-navy px-6 py-3 font-medium text-white hover:bg-brand-blue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy"
          >
            Join AnderTech
          </a>
        ) : (
          <p className="text-zinc-700 dark:text-zinc-300">
            Join link coming soon.
          </p>
        )}

        {site.contactEmail && (
          <p className="text-zinc-700 dark:text-zinc-300">
            Contact:{" "}
            <a className="underline" href={`mailto:${site.contactEmail}`}>
              {site.contactEmail}
            </a>
          </p>
        )}

        {activeSocialLinks.length > 0 && (
          <p className="flex gap-4 text-zinc-700 dark:text-zinc-300">
            {activeSocialLinks.map((link) => (
              <a key={link.label} className="underline" href={link.href!}>
                {link.label}
              </a>
            ))}
          </p>
        )}
      </section>

      <BoardSection />
      <EventsSection />
    </main>
  );
}
