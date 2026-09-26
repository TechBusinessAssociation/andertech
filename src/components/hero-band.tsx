// The "Airy" band shared by the landing page, the members home and the sign-in
// pages: a light sky-to-cream wash (deep navy in dark mode) with a faint globe
// and network drawing echoing the club's hero artwork. Callers pass the
// content and are responsible for the inner container width.
//
// The drawing is a complete illustration: everything sits inside its own
// 460x300 frame and `meet` scales it to fit, so it is never cropped, whatever
// the size of the band.
export function HeroBand({
  labelledBy,
  className = "",
  children,
}: {
  labelledBy: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      aria-labelledby={labelledBy}
      className={`relative isolate overflow-hidden bg-linear-to-br from-brand-sky via-white to-brand-cream text-brand-navy dark:from-[#12324f] dark:via-[#0d2136] dark:to-[#2a230f] dark:text-white ${className}`}
    >
      <svg
        viewBox="0 0 460 300"
        preserveAspectRatio="xMaxYMid meet"
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 -z-10 h-full w-[min(55%,460px)] text-brand-blue/30 dark:text-[#7dbbec]/30"
      >
        {/* Globe: outer and inner ring, meridians, equator and a latitude. */}
        <g fill="none" stroke="currentColor" strokeWidth="1">
          <circle cx="300" cy="150" r="125" />
          <circle cx="300" cy="150" r="78" />
          <ellipse cx="300" cy="150" rx="55" ry="125" />
          <ellipse cx="300" cy="150" rx="125" ry="42" />
          <path d="M175 150 H425" />
          <path d="M300 25 V275" />
        </g>
        {/* Network: lines between nodes that all lie on or inside the globe. */}
        <g fill="none" stroke="currentColor" strokeWidth="1.25">
          <path d="M190 190 L236 88 L318 62 L392 120 L372 222 L268 236 Z" />
          <path d="M236 88 L300 150 L392 120" />
          <path d="M318 62 L300 150 L372 222" />
          <path d="M190 190 L300 150 L268 236" />
        </g>
        {/* Glowing gold nodes. */}
        <g className="fill-brand-gold" fillOpacity="0.28">
          <circle cx="236" cy="88" r="10" />
          <circle cx="392" cy="120" r="10" />
          <circle cx="268" cy="236" r="10" />
        </g>
        <g className="fill-brand-gold">
          <circle cx="236" cy="88" r="4.5" />
          <circle cx="392" cy="120" r="4.5" />
          <circle cx="268" cy="236" r="4.5" />
          <circle cx="300" cy="150" r="3.5" />
        </g>
        {/* Quiet nodes on the network and on the ring. */}
        <g fill="currentColor">
          <circle cx="190" cy="190" r="3" />
          <circle cx="318" cy="62" r="3" />
          <circle cx="372" cy="222" r="3" />
          <circle cx="300" cy="25" r="2.5" />
          <circle cx="425" cy="150" r="2.5" />
          <circle cx="300" cy="275" r="2.5" />
          <circle cx="175" cy="150" r="2.5" />
        </g>
      </svg>
      {children}
    </section>
  );
}
