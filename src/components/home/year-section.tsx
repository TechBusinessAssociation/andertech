import Image from "next/image";
import { Wrap } from "@/components/home/ui";
import { year } from "../../../content/home";

// Where each photo sits on wide screens (xl and up), in the same order as
// year.tiles in content/home.ts. x and w are percentages of the stage width,
// y is pixels from its top, pw/ph the photo's size in pixels, dx/dy where it
// flies in from, and a0/a1 the part of the scroll (in %) it flies in during.
// Below xl the tiles are just a grid and none of this applies.
const layout = [
  { x: 0, y: 20, w: 52.7, pw: 300, ph: 116, dx: -220, dy: 0, a0: 2, a1: 15 },
  { x: 53.6, y: 150, w: 46.4, pw: 220, ph: 261, dx: 220, dy: 0, a0: 8, a1: 21, flip: true },
  { x: 8.9, y: 430, w: 44.6, pw: 230, ph: 308, dx: 0, dy: 190, a0: 20, a1: 33 },
  { x: 53.6, y: 660, w: 46.4, pw: 260, ph: 194, dx: 240, dy: 0, a0: 27, a1: 40, flip: true },
  { x: 1.8, y: 940, w: 50, pw: 300, ph: 227, dx: -220, dy: 0, a0: 40, a1: 53 },
  { x: 53.6, y: 1170, w: 46.4, pw: 260, ph: 76, dx: 0, dy: 190, a0: 49, a1: 62 },
];

// "A year in the club": photos arriving out of depth as you scroll (pure CSS,
// see .year-stage in globals.css -- no JavaScript, so the page stays static).
// Browsers without scroll-driven animations, and anyone who prefers reduced
// motion, just see every photo in place. The section's clip-path (not
// overflow: hidden) is deliberate: overflow would make it a scroll container
// and freeze the animation.
export function YearSection() {
  return (
    <section
      aria-labelledby="year-heading"
      data-section="year-in-the-club"
      className="relative isolate bg-brand-deep py-16 text-white [clip-path:inset(0)] md:py-24"
    >
      <div
        aria-hidden="true"
        className="absolute -inset-[8%] -z-20 bg-cover bg-[position:50%_38%] blur-[44px] brightness-50 saturate-[.7]"
        style={{ backgroundImage: `url(${year.tiles[0].photo.src})` }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(86%_58%_at_50%_46%,rgb(9_24_37/0.1)_0%,rgb(9_24_37/0.8)_66%,#091825_100%)]"
      />

      <Wrap>
        <div className="mb-10 grid items-end gap-4 md:grid-cols-[7fr_5fr] md:gap-12">
          <div>
            <p className="font-mono text-xs font-medium uppercase tracking-[0.14em] text-[#9cc6ea]">
              {year.label}
            </p>
            <h2
              id="year-heading"
              className="mt-4 max-w-[14ch] font-display text-4xl font-bold leading-none tracking-[-0.035em] md:text-6xl"
            >
              {year.heading}
            </h2>
          </div>
          <p className="max-w-[44ch] text-[17px] text-white/75">{year.intro}</p>
        </div>

        <div className="year-stage grid gap-10 md:grid-cols-2 xl:relative xl:block xl:h-[1440px]">
          {year.tiles.slice(0, layout.length).map((tile, i) => {
            const l = layout[i];
            return (
              <figure
                key={tile.title}
                className={`year-tile flex flex-col gap-3.5 xl:absolute xl:left-[var(--x)] xl:top-[var(--y)] xl:w-[var(--w)] xl:items-start xl:gap-[26px] ${
                  l.flip ? "xl:flex-row-reverse" : "xl:flex-row"
                }`}
                style={
                  {
                    "--x": `${l.x}%`,
                    "--y": `${l.y}px`,
                    "--w": `${l.w}%`,
                    "--pw": `${l.pw}px`,
                    "--ph": `${l.ph}px`,
                    "--dx": `${l.dx}px`,
                    "--dy": `${l.dy}px`,
                    "--a0": `${l.a0}%`,
                    "--a1": `${l.a1}%`,
                  } as React.CSSProperties
                }
              >
                <Image
                  src={tile.photo.src}
                  alt={tile.photo.alt}
                  width={tile.photo.width}
                  height={tile.photo.height}
                  sizes="(min-width: 1280px) 300px, (min-width: 768px) 50vw, 100vw"
                  className="h-52 w-full object-cover xl:h-[var(--ph)] xl:w-[var(--pw)] xl:flex-none xl:shadow-[0_34px_90px_rgba(0,0,0,0.6)]"
                />
                <figcaption className="min-w-0 xl:flex-1">
                  <span className="block font-mono text-xs font-medium uppercase tracking-[0.14em] text-brand-gold">
                    {tile.label}
                  </span>
                  <h3 className="mt-3 font-display text-[22px] font-bold leading-[1.12] tracking-[-0.035em] xl:text-[25px]">
                    {tile.title}
                  </h3>
                  <p className="mt-3 text-[14.5px] leading-relaxed text-white/70">
                    {tile.note}
                  </p>
                  <span className="mt-4 block border-t border-white/20 pt-3 font-mono text-[11px] uppercase tracking-[0.14em] text-white/50">
                    {tile.credit}
                  </span>
                </figcaption>
              </figure>
            );
          })}
        </div>
      </Wrap>
    </section>
  );
}
