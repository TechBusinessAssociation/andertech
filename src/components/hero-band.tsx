// The "Airy" band shared by the landing page, the members home and the sign-in
// pages: a light sky-to-cream wash (deep navy in dark mode) with a faint globe
// and network drawing echoing the club's hero artwork. Callers pass the
// content and are responsible for the inner container width.
//
// Two placements of the same big drawing:
//  - "corner" (default): the globe is centered on the band's bottom-right
//    corner, so only its top-left quarter shows, curving in from the right
//    side. Used on the landing page and the members home.
//  - "large": the globe runs off the right edge so about 40% of it shows,
//    used behind the sign-in and request-access cards.

// The drawing itself: everything sits on or inside a globe centered at
// (300,150) with radius 125. Lines are 1px however large the drawing is scaled
// (non-scaling strokes), and the dots are sized to suit the big versions.
const line = { vectorEffect: "non-scaling-stroke" as const };
const r = (n: number) => n * 0.6;

function Globe() {
  return (
    <>
      {/* Globe: outer and inner ring, meridians, equator and a latitude. */}
      <g fill="none" stroke="currentColor" strokeWidth="1">
        <circle cx="300" cy="150" r="125" {...line} />
        <circle cx="300" cy="150" r="78" {...line} />
        <ellipse cx="300" cy="150" rx="55" ry="125" {...line} />
        <ellipse cx="300" cy="150" rx="125" ry="42" {...line} />
        <path d="M175 150 H425" {...line} />
        <path d="M300 25 V275" {...line} />
      </g>
      {/* Network: lines between nodes that all lie on or inside the globe. */}
      <g fill="none" stroke="currentColor" strokeWidth="1.25">
        <path d="M190 190 L236 88 L318 62 L392 120 L372 222 L268 236 Z" {...line} />
        <path d="M236 88 L300 150 L392 120" {...line} />
        <path d="M318 62 L300 150 L372 222" {...line} />
        <path d="M190 190 L300 150 L268 236" {...line} />
      </g>
      {/* Glowing gold nodes. */}
      <g className="fill-brand-gold" fillOpacity="0.28">
        <circle cx="236" cy="88" r={r(10)} />
        <circle cx="392" cy="120" r={r(10)} />
        <circle cx="268" cy="236" r={r(10)} />
      </g>
      <g className="fill-brand-gold">
        <circle cx="236" cy="88" r={r(4.5)} />
        <circle cx="392" cy="120" r={r(4.5)} />
        <circle cx="268" cy="236" r={r(4.5)} />
        <circle cx="300" cy="150" r={r(3.5)} />
      </g>
      {/* Quiet nodes on the network and on the ring. */}
      <g fill="currentColor">
        <circle cx="190" cy="190" r={r(3)} />
        <circle cx="318" cy="62" r={r(3)} />
        <circle cx="372" cy="222" r={r(3)} />
        <circle cx="300" cy="25" r={r(2.5)} />
        <circle cx="425" cy="150" r={r(2.5)} />
        <circle cx="300" cy="275" r={r(2.5)} />
        <circle cx="175" cy="150" r={r(2.5)} />
      </g>
    </>
  );
}

export function HeroBand({
  labelledBy,
  className = "",
  art = "corner",
  children,
}: {
  labelledBy: string;
  className?: string;
  art?: "corner" | "large";
  children: React.ReactNode;
}) {
  return (
    <section
      aria-labelledby={labelledBy}
      className={`relative isolate overflow-hidden bg-linear-to-br from-brand-sky via-white to-brand-cream text-brand-navy dark:from-[#12324f] dark:via-[#0d2136] dark:to-[#2a230f] dark:text-white ${className}`}
    >
      {art === "large" ? (
        // Square, taller than the band, parked with its left 40% on screen:
        // `left-full` puts its left edge at the band's right edge, and the
        // -40% shift pulls 40% of its width back in. Smaller on phones.
        <svg
          viewBox="170 20 260 260"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
          className="pointer-events-none absolute left-full top-1/2 -z-10 aspect-square h-[70%] -translate-x-[40%] -translate-y-1/2 text-brand-blue/30 md:h-[112%] dark:text-[#7dbbec]/30"
        >
          <Globe />
        </svg>
      ) : (
        // Centered on the band's bottom-right corner (`left-full top-full`
        // pulled back by half its own size), so the band shows the globe's
        // top-left quarter. Sized by width on phones (a small corner piece)
        // and by the band's height from tablet width up.
        <svg
          viewBox="170 20 260 260"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
          className="pointer-events-none absolute left-full top-full -z-10 aspect-square w-[95vw] -translate-x-1/2 -translate-y-1/2 text-brand-blue/30 md:h-[185%] md:w-auto dark:text-[#7dbbec]/30"
        >
          <Globe />
        </svg>
      )}
      {children}
    </section>
  );
}
