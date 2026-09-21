import { site } from "../../content/site";
import { links } from "../../content/links";

// Hello-world landing page. All text and links come from /content so the
// board can edit them without touching this file.
export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-6 px-6 py-16">
      <h1 className="text-4xl font-semibold tracking-tight">{site.name}</h1>
      {site.officialName && (
        <p className="text-lg text-zinc-700 dark:text-zinc-300">
          {site.officialName}
        </p>
      )}
      <p className="text-xl text-zinc-700 dark:text-zinc-300">{site.tagline}</p>

      {links.joinSurvey ? (
        <a
          href={links.joinSurvey}
          className="inline-flex min-h-12 w-fit items-center rounded-lg bg-zinc-900 px-6 py-3 font-medium text-white hover:bg-zinc-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 dark:focus-visible:outline-white"
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
    </main>
  );
}
