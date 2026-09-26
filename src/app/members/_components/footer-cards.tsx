import Link from "next/link";

// Bottom row: a help card for everyone, and an admin shortcut only admins see.
export function FooterCards({
  isAdmin,
  contactEmail,
}: {
  isAdmin: boolean;
  contactEmail: string | null;
}) {
  return (
    <section
      aria-label="Help"
      className={`grid gap-3 py-8 md:py-10 ${isAdmin ? "md:grid-cols-[1.4fr_1fr]" : ""}`}
    >
      <div className="grid content-start gap-2 rounded-2xl bg-brand-cream p-[18px] text-brand-navy dark:bg-[#33290f] dark:text-zinc-100">
        <h2 className="text-base font-semibold tracking-tight">
          Broken link or missing something?
        </h2>
        <p className="text-sm opacity-80">
          {contactEmail
            ? "Tell the board and we will fix it or add it."
            : "Tell a board member and we will fix it or add it."}
        </p>
        {contactEmail && (
          <a
            href={`mailto:${contactEmail}`}
            className="mt-1 inline-flex min-h-11 w-fit items-center rounded-[10px] border border-brand-navy/15 bg-white px-[18px] text-sm font-semibold text-brand-navy hover:bg-brand-sky dark:border-white/15 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
          >
            Contact the board
          </a>
        )}
      </div>

      {isAdmin && (
        <div className="grid content-start gap-2 rounded-2xl border-[1.5px] border-dashed border-zinc-300 p-[18px] dark:border-zinc-700">
          <span className="font-mono text-[11px] uppercase tracking-wide text-zinc-500">
            Only admins see this
          </span>
          <h2 className="text-base font-semibold tracking-tight">Admin tools</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Manage members, resources and events.
          </p>
          <Link
            href="/admin"
            className="inline-flex min-h-11 w-fit items-center text-sm font-semibold text-brand-blue hover:underline dark:text-[#7dbbec]"
          >
            Open admin &rarr;
          </Link>
        </div>
      )}
    </section>
  );
}
