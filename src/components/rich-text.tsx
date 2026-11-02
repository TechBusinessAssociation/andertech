import type { ReactNode } from "react";

// Renders the newsletter's plain-text fields (intro, item body, Editor's take,
// closing) with a tiny, safe subset of Markdown, so editors can keep links and
// bold when they move text over from a Word doc. No package, and never raw
// HTML: everything is built as React nodes, so nothing an editor types can
// inject markup or script.
//
//   [link text](https://example.com)   a link (also works for mailto:)
//   https://example.com                a bare address becomes a link
//   **bold**                           bold
//   - item / * item                    a bulleted list (every line in the block)
//   1. item                            a numbered list (every line in the block)
//   a blank line starts a new paragraph; a single line break is kept
//
// Only http(s) and mailto links are ever made clickable; anything else
// (javascript:, data:, ...) is shown as the text it was typed as.
const INLINE =
  /\[([^\]\n]+)\]\(([^)\s]+)\)|\*\*([^*\n]+)\*\*|(https?:\/\/[^\s<]+)/g;
const SAFE_URL = /^(https?:\/\/|mailto:)/i;
const linkClass =
  "break-words text-brand-navy underline hover:text-brand-blue dark:text-brand-blue";

function link(href: string, label: ReactNode, key: string) {
  const external = /^https?:/i.test(href);
  return (
    <a
      key={key}
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={linkClass}
    >
      {label}
    </a>
  );
}

function inline(text: string, keyPrefix: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let n = 0;
  for (const match of text.matchAll(INLINE)) {
    const start = match.index ?? 0;
    if (start > last) out.push(text.slice(last, start));
    const key = `${keyPrefix}-${n++}`;
    if (match[1] !== undefined) {
      out.push(SAFE_URL.test(match[2]) ? link(match[2], match[1], key) : match[0]);
    } else if (match[3] !== undefined) {
      out.push(<strong key={key}>{match[3]}</strong>);
    } else {
      // A bare address: leave sentence punctuation after it out of the link.
      let url = match[4];
      const trailing = url.match(/[.,;:!?)]+$/)?.[0] ?? "";
      if (trailing) url = url.slice(0, -trailing.length);
      out.push(link(url, url, key));
      if (trailing) out.push(trailing);
    }
    last = start + match[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

const BULLET = /^\s*[-*] +/;
const NUMBERED = /^\s*\d+[.)] +/;

export function RichText({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  // Browsers send textarea line breaks as \r\n; normalise before splitting.
  const clean = text.replace(/\r\n?/g, "\n").trim();
  if (!clean) return null;

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {clean.split(/\n{2,}/).map((block, i) => {
        const lines = block.split("\n");
        if (lines.every((line) => BULLET.test(line))) {
          return (
            <ul key={i} className="flex list-disc flex-col gap-1 pl-6">
              {lines.map((line, j) => (
                <li key={j}>{inline(line.replace(BULLET, ""), `${i}-${j}`)}</li>
              ))}
            </ul>
          );
        }
        if (lines.every((line) => NUMBERED.test(line))) {
          return (
            <ol key={i} className="flex list-decimal flex-col gap-1 pl-6">
              {lines.map((line, j) => (
                <li key={j}>{inline(line.replace(NUMBERED, ""), `${i}-${j}`)}</li>
              ))}
            </ol>
          );
        }
        return (
          <p key={i} className="whitespace-pre-line">
            {inline(block, String(i))}
          </p>
        );
      })}
    </div>
  );
}
