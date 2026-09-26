// The "Airy" welcome band shared by the landing page and the members home: a
// light sky-to-cream wash (deep navy in dark mode) with a faint network
// drawing echoing the club's hero artwork. Callers pass the content and are
// responsible for the inner container width.
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
        preserveAspectRatio="xMaxYMid slice"
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 -z-10 h-full w-[min(55%,460px)] text-brand-blue/30 dark:text-[#7dbbec]/30"
      >
        <g fill="none" stroke="currentColor" strokeWidth="1">
          <path d="M40 260 L150 120 L290 170 L420 40" />
          <path d="M150 120 L230 30 L420 40" />
          <path d="M290 170 L400 250" />
          <path d="M40 260 L290 170" />
          <circle cx="300" cy="120" r="150" />
          <circle cx="300" cy="120" r="95" />
        </g>
        <g className="fill-brand-gold">
          <circle cx="150" cy="120" r="3.5" />
          <circle cx="290" cy="170" r="3.5" />
          <circle cx="420" cy="40" r="3.5" />
          <circle cx="230" cy="30" r="3" />
        </g>
        <g fill="currentColor">
          <circle cx="40" cy="260" r="3" />
          <circle cx="400" cy="250" r="3" />
        </g>
      </svg>
      {children}
    </section>
  );
}
