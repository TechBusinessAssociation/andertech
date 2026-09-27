import Image from "next/image";
import { chapters, programsIntro, type Chapter } from "../../content/programs";

// "What we do": one chapter after another, each with a rule and numbered
// label, a big statement, the list of programs, and a large photo with a short
// caption. Laid out like an editorial page: text on one side, photo on the
// other, swapping sides every chapter so the eye zigzags down the page; on
// phones the order is label + statement, photo + caption, then the programs.
// All copy and photo paths come from content/programs.ts.
//
// The program lists deliberately have no divider lines: they run at their own
// spacing across the background grid (a faint line grid, see globals.css) and
// the two sets of lines clash. Spacing alone separates the items.
//
// Motion is CSS only (see "Scroll-driven motion" in globals.css): each piece
// (`reveal`) rises and fades in as it scrolls into view, staggered by
// --r0/--r1, and the picture inside a photo frame (`drift`) moves a little
// slower than the page. Nothing here reads a session or runs JavaScript, so
// the home page stays static; browsers without scroll-driven animations, and
// people who ask for reduced motion, just get the finished layout.

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
// hero's colors so the layout looks finished before photos exist. The frame
// clips the moving picture (see .media-frame / .drift in globals.css).
function Media({ chapter, number }: { chapter: Chapter; number: string }) {
  if (chapter.photo) {
    return (
      <div className="media-frame relative aspect-4/3 overflow-hidden rounded-2xl bg-brand-sky shadow-sm dark:bg-[#12324f]">
        <Image
          src={chapter.photo.src}
          alt={chapter.photo.alt}
          fill
          sizes="(min-width: 1024px) 560px, (min-width: 768px) 55vw, 100vw"
          quality={90}
          className="drift object-cover"
        />
      </div>
    );
  }
  return (
    <div
      aria-hidden="true"
      className="media-frame relative aspect-4/3 overflow-hidden rounded-2xl bg-linear-to-br from-brand-sky via-white to-brand-cream shadow-sm dark:from-[#12324f] dark:via-[#0d2136] dark:to-[#2a230f]"
    >
      <span className="drift-numeral absolute -bottom-6 left-6 text-[9rem] font-semibold leading-none tracking-tighter text-brand-blue/25 md:text-[12rem] dark:text-[#7dbbec]/25">
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
      className="chapters-grid overflow-x-clip"
    >
      <div className="mx-auto max-w-5xl px-5 py-12 md:py-20">
        <div className="max-w-2xl">
          <div className="reveal [--r1:18%]">
            <Label>{programsIntro.label}</Label>
          </div>
          <h2
            id="what-we-do-heading"
            className="reveal mt-5 text-4xl font-semibold leading-[1.05] tracking-tight text-balance md:text-5xl [--r0:4%] [--r1:24%]"
          >
            {programsIntro.heading}
          </h2>
        </div>

        {chapters.map((chapter, index) => {
          const number = String(index + 1).padStart(2, "0");
          // Every other chapter puts the photo on the left. Class names are
          // spelled out in full so Tailwind can see them.
          const flip = index % 2 === 1;
          return (
            <article
              key={chapter.id}
              id={chapter.id}
              aria-label={chapter.label}
              className={`mt-14 grid scroll-mt-6 gap-x-14 gap-y-8 md:mt-20 md:items-start ${
                flip ? "md:grid-cols-[7fr_5fr]" : "md:grid-cols-[5fr_7fr]"
              }`}
            >
              <div
                className={`md:row-start-1 ${flip ? "md:col-start-2" : "md:col-start-1"}`}
              >
                <div className="reveal border-t border-zinc-900/25 pt-5 [--r1:18%] dark:border-white/25">
                  <Label number={number}>{chapter.label}</Label>
                </div>
                <h3 className="reveal mt-6 text-3xl font-medium leading-[1.12] tracking-tight text-balance md:text-4xl [--r0:4%] [--r1:24%]">
                  {chapter.heading}
                </h3>
              </div>

              <div
                className={`md:row-span-2 md:row-start-1 ${flip ? "md:col-start-1" : "md:col-start-2"}`}
              >
                <div
                  className={`reveal [--r1:28%] ${flip ? "md:[--dx:-36px]" : "md:[--dx:36px]"}`}
                >
                  <Media chapter={chapter} number={number} />
                </div>
                <p className="reveal mt-6 max-w-[52ch] text-lg leading-snug text-pretty text-zinc-800 md:text-xl dark:text-zinc-200 [--r0:6%] [--r1:26%]">
                  {chapter.body}
                </p>
              </div>

              <ul
                className={`grid gap-6 md:row-start-2 ${
                  flip ? "md:col-start-2" : "md:col-start-1"
                }`}
              >
                {chapter.programs.map((program) => (
                  <li key={program.title} className="reveal [--r1:20%]">
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
