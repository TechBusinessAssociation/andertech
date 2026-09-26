import Link from "next/link";
import { HeroBand } from "@/components/hero-band";

// Shared frame for the sign-in and request-access pages: the Airy band with a
// centered card and a way back to the home page.
export function AuthShell({
  labelledBy,
  children,
}: {
  labelledBy: string;
  children: React.ReactNode;
}) {
  return (
    <main className="flex flex-1 flex-col">
      <HeroBand labelledBy={labelledBy} className="flex flex-1 items-center">
        <div className="mx-auto w-full max-w-5xl px-5 py-10 md:py-16">
          <div className="mx-auto grid w-full max-w-md gap-5 rounded-2xl border border-white/70 bg-white/85 p-6 text-brand-navy shadow-sm backdrop-blur-sm md:p-8 dark:border-white/10 dark:bg-zinc-900/85 dark:text-zinc-100">
            {children}
          </div>

          <p className="mt-5 text-center">
            <Link
              href="/"
              className="inline-flex min-h-11 items-center text-sm font-medium text-brand-blue hover:underline dark:text-[#7dbbec]"
            >
              &larr; Back to home
            </Link>
          </p>
        </div>
      </HeroBand>
    </main>
  );
}

export const eyebrowClass =
  "text-xs font-semibold uppercase tracking-[0.12em] text-brand-navy/70 dark:text-white/70";

export const authButtonBase =
  "inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-xl border px-5 text-[15px] font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue";

export const authButtonNeutral = `${authButtonBase} border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800`;

export const authButtonPrimary = `${authButtonBase} border-transparent bg-brand-navy text-white hover:bg-brand-blue dark:bg-brand-gold dark:text-brand-navy dark:hover:brightness-105`;

export const authInputClass =
  "min-h-12 w-full rounded-xl border border-zinc-300 bg-white px-3.5 text-[15px] text-zinc-900 placeholder:text-zinc-500 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand-blue dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100";
