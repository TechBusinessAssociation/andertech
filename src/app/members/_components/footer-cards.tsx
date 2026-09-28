// Bottom of the members page: where to report a broken link or ask for
// something. It is a plain mailto link (no server, no secrets): the subject
// is pre-filled with a fixed prefix so the board can filter these in the
// shared inbox.
export function FooterCards({
  contactEmail,
  subjectPrefix,
}: {
  contactEmail: string | null;
  subjectPrefix: string;
}) {
  const mailto = contactEmail
    ? `mailto:${contactEmail}?subject=${encodeURIComponent(`${subjectPrefix}: `)}&body=${encodeURIComponent(
        "What is broken, or what are you missing?\n\n",
      )}`
    : null;

  return (
    <section aria-label="Help" className="py-8 md:py-10">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-brand-cream p-[18px] text-brand-navy dark:bg-[#33290f] dark:text-zinc-100">
        <p className="text-sm">
          <span className="font-semibold">Broken link or missing something?</span>{" "}
          <span className="opacity-80">
            {contactEmail
              ? "Tell the board and we will fix it or add it."
              : "Tell a board member and we will fix it or add it."}
          </span>
        </p>
        {mailto && (
          <a
            href={mailto}
            className="inline-flex min-h-11 shrink-0 items-center rounded-[10px] border border-brand-navy/15 bg-white px-[18px] text-sm font-semibold text-brand-navy hover:bg-brand-sky dark:border-white/15 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
          >
            Send feedback by email
          </a>
        )}
      </div>
    </section>
  );
}
