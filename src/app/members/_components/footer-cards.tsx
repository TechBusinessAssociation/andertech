// Bottom of the members page: where to report a broken link or ask for
// something. It is a plain mailto link (no server, no secrets): the subject is
// pre-filled with a fixed prefix so the board can filter these in the shared
// inbox. The address is also printed, because mailto does nothing on a device
// with no mail app set up.
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
      <div className="grid content-start gap-2 rounded-2xl bg-brand-cream p-[18px] text-brand-navy dark:bg-[#33290f] dark:text-zinc-100">
        <h2 className="text-base font-semibold tracking-tight">
          Broken link or missing something?
        </h2>
        <p className="text-sm opacity-80">
          {contactEmail
            ? "Tell the board and we will fix it or add it."
            : "Tell a board member and we will fix it or add it."}
        </p>
        {mailto && contactEmail && (
          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-2">
            <a
              href={mailto}
              className="inline-flex min-h-11 w-fit items-center rounded-[10px] border border-brand-navy/15 bg-white px-[18px] text-sm font-semibold text-brand-navy hover:bg-brand-sky dark:border-white/15 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
            >
              Send feedback by email
            </a>
            <span className="text-[13px] opacity-75">
              or write to{" "}
              <span className="select-all font-medium">{contactEmail}</span>
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
