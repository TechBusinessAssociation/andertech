import Image from "next/image";
import { chapters, programsIntro, type Chapter } from "../../content/programs";

// "What we do": one chapter after another, each with a rule and numbered
// label, a big statement, the list of programs, and a large photo with a short
// caption. Laid out like an editorial page: text on the left, photo on the
// right on wider screens; on phones the order is label + statement, photo +
// caption, then the programs. All copy and photo paths come from
// content/programs.ts. Renders no session data, so the home page stays static.

function Label({ number, children }: { number?: string; children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-3.5 text-xs font-semibold uppercase tracking-[0.16em]">
      <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-brand-gold" />
      {number && <span aria-hidden="true">{number}</span>}
      <span>{children}</span>
    </p>
  );
}

// A photo when the chapter has one, otherwise a numbered panel in the
// hero's colors so the layout looks finished before photos exist.
function Media({ chapter, number }: { chapter: Chapter; number: string }) {
  if (chapter.photo) {
    return (
      <div className="relative aspect-4/3 overflow-hidden rounded-2xl bg-brand-sky shadow-sm dark:bg-[#12324f]">
        <Image
          src={chapter.photo.src}
          alt={chapter.photo.alt}
          fill
          sizes="(min-width: 1024px) 560px, (min-width: 768px) 55vw, 100vw"
          className="object-cover"
        />
      </div>
    );
  }
  return (
    <div
      aria-hidden="true"
      className="relative aspect-4/3 overflow-hidden rounded-2xl bg-linear-to-br from-brand-sky via-white to-brand-cream shadow-sm dark:from-[#12324f] dark:via-[#0d2136] dark:to-[#2a230f]"
    >
      <span className="absolute -bottom-6 left-6 text-[9rem] font-semibold leading-none tracking-tighter text-brand-blue/25 md:text-[12rem] dark:text-[#7dbbec]/25">
        {number}
      </span>
    </div>
  );
}

export function WhatWeDoSection() {
  return (
    <section
      id="what-we-do"
      aria-labelledby="what-we-do-heading"
      className="chapters-grid"
    >
      <div className="mx-auto max-w-5xl px-5 py-12 md:py-20">
        <div className="max-w-2xl">
          <Label>{programsIntro.label}</Label>
          <h2
            id="what-we-do-heading"
            className="mt-5 text-4xl font-semibold leading-[1.05] tracking-tight text-balance md:text-5xl"
          >
            {programsIntro.heading}
          </h2>
        </div>

        {chapters.map((chapter, index) => {
          const number = String(index + 1).padStart(2, "0");
          return (
            <article
              key={chapter.id}
              id={chapter.id}
              aria-label={chapter.label}
              className="mt-14 grid scroll-mt-6 gap-x-14 gap-y-8 md:mt-20 md:grid-cols-[5fr_7fr] md:items-start"
            >
              <div className="border-t border-zinc-900/25 pt-5 md:col-start-1 md:row-start-1 dark:border-white/25">
                <Label number={number}>{chapter.label}</Label>
                <h3 className="mt-6 text-3xl font-medium leading-[1.12] tracking-tight text-balance md:text-4xl">
                  {chapter.heading}
                </h3>
              </div>

              <div className="md:col-start-2 md:row-span-2 md:row-start-1">
                <Media chapter={chapter} number={number} />
                <p className="mt-6 max-w-[52ch] text-lg leading-snug text-zinc-800 md:text-xl dark:text-zinc-200">
                  {chapter.body}
                </p>
              </div>

              <ul className="divide-y divide-zinc-900/10 border-y border-zinc-900/10 md:col-start-1 md:row-start-2 dark:divide-white/10 dark:border-white/10">
                {chapter.programs.map((program) => (
                  <li key={program.title} className="py-3.5">
                    <p className="font-semibold">{program.title}</p>
                    <p className="mt-0.5 text-sm text-zinc-600 dark:text-zinc-400">
                      {program.blurb}
                    </p>
                  </li>
                ))}
              </ul>
            </article>
          );
        })}
      </div>
    </section>
  );
}
