import { board } from "../../content/board";

// "Jane Q. Doe" -> "JD". Initials stand in for photos, which are only added
// with each person's consent (see content/board.ts).
function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1][0] ?? "") : "";
  return (first + last).toUpperCase();
}

// Renders content/board.ts. Empty array -> a "coming soon" placeholder,
// so this is safe to ship even before the board list is finalized.
export function BoardSection() {
  return (
    <section aria-labelledby="board-heading" className="pt-10 md:pt-14">
      <div className="mb-3.5">
        <h2 id="board-heading" className="text-xl font-semibold tracking-tight md:text-2xl">
          Board
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          The people running AnderTech this year.
        </p>
      </div>
      {board.length > 0 ? (
        <ul className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {board.map((member) => (
            <li
              key={`${member.name}-${member.role}`}
              className="flex items-center gap-3.5 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            >
              <span
                aria-hidden="true"
                className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand-sky text-sm font-semibold text-brand-blue dark:bg-[#14324d] dark:text-[#7dbbec]"
              >
                {initials(member.name)}
              </span>
              <div className="min-w-0">
                <p className="font-medium leading-snug">{member.name}</p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {member.role}
                </p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-2xl border border-dashed border-zinc-300 p-5 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
          Board list coming soon.
        </p>
      )}
    </section>
  );
}
