import { Bricolage_Grotesque } from "next/font/google";

// Display face for the landing page's big headlines (the body text stays
// Geist). Loaded here, not in the root layout, so only pages that use it
// download it. `font-display` (globals.css) reads the variable below.
export const displayFont = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});

// Page width shared by every landing section; matches the header on "/".
export function Wrap({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto max-w-[1200px] px-5 md:px-10 ${className}`}>
      {children}
    </div>
  );
}

// Small uppercase section label.
export function SectionLabel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={`font-mono text-xs font-medium uppercase tracking-[0.14em] text-brand-blue dark:text-[#9cc6ea] ${className}`}
    >
      {children}
    </p>
  );
}

// Big section heading in the display face.
export function SectionHeading({
  id,
  children,
  className = "",
}: {
  id?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2
      id={id}
      className={`mt-5 font-display text-4xl font-bold leading-none tracking-[-0.035em] text-balance md:text-6xl ${className}`}
    >
      {children}
    </h2>
  );
}
