// The "Airy" band shared by the landing page, the members home and the sign-in
// pages: a light sky-to-cream wash (deep navy in dark mode) with a faint globe
// and network drawing echoing the club's hero artwork. Callers pass the
// content and are responsible for the inner container width.
//
// Two sizes of the same drawing:
//  - "compact" (default): a small, complete illustration tucked into the right
//    side of the band, scaled with `meet` so it is never cropped.
//  - "large": a big version that runs off the right edge so only about 40% of
//    it shows, used behind the sign-in and request-access cards.

// The drawing itself: everything sits on or inside a globe centered at
// (300,150) with radius 125. `hairline` keeps every line 1px thick however
// large the drawing is scaled, and `nodeScale` shrinks the dots to match.
function Globe({
  hairline,
  nodeScale,
}: {
  hairline: boolean;
  nodeScale: number;
}) {
  const line = hairline ? { vectorEffect: "non-scaling-stroke" as const } : {};
  const r = (n: number) => n * nodeScale;
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
  art = "compact",
  children,
}: {
  labelledBy: string;
  className?: string;
  art?: "compact" | "large";
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
          <Globe hairline nodeScale={0.6} />
        </svg>
      ) : (
        <svg
          viewBox="0 0 460 300"
          preserveAspectRatio="xMaxYMid meet"
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 -z-10 h-full w-[min(55%,460px)] text-brand-blue/30 dark:text-[#7dbbec]/30"
        >
          <Globe hairline={false} nodeScale={1} />
        </svg>
      )}
      {children}
    </section>
  );
}
