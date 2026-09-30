import { membership } from "../../content/membership";

// "Become a member" on the home page: a plain <details>/<summary> dropdown
// (same pattern as the header's account menu) rather than a <select> that
// needs JavaScript to navigate on change -- this works without JS, and each
// term is just a link to its own Crowded checkout page. Hides itself
// entirely if no term has a URL set yet (content/membership.ts).
export function MembershipCta() {
  const terms = membership.terms.filter(
    (term): term is { label: string; url: string } => Boolean(term.url),
  );
  if (terms.length === 0) return null;

  return (
    <details className="group relative inline-block">
      <summary className="inline-flex min-h-11 cursor-pointer list-none items-center gap-1.5 rounded-[10px] bg-brand-navy px-[18px] text-sm font-semibold text-white hover:bg-brand-blue dark:bg-brand-gold dark:text-brand-navy dark:hover:brightness-105">
        Become a member
        <svg
          viewBox="0 0 16 16"
          className="size-3.5 shrink-0 transition-transform group-open:rotate-180"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M4 6.5 8 10l4-3.5" />
        </svg>
      </summary>
      {/* mt-1.5, and the same border/shadow as the summary's own focus
          ring, so the panel reads as part of the button rather than a
          second, separate floating box. */}
      <div className="absolute left-0 z-20 mt-1.5 w-64 overflow-hidden rounded-xl border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
        {terms.map((term) => (
          <a
            key={term.label}
            href={term.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block px-3.5 py-2 text-sm text-zinc-800 hover:bg-zinc-100 dark:text-zinc-100 dark:hover:bg-zinc-800"
          >
            {term.label}
          </a>
        ))}
      </div>
    </details>
  );
}
