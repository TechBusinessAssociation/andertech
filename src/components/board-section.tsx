import Image from "next/image";
import { board, boardPhoto } from "../../content/board";

// The board: the group photo, then everyone in one collapsed list. Every
// member is shown the same way on purpose -- no highlighted roles and no tiers
// -- so nobody is set apart (the order is simply the order in
// content/board.ts). The list is a plain <details>, so it works without
// JavaScript and the names are still in the page. Same label + statement
// heading and scroll reveal as "What we do" (see globals.css). An empty list
// shows a "coming soon" note, so it is safe to ship before the board is final.
export function BoardSection() {
  return (
    <section
      id="board"
      aria-labelledby="board-heading"
      className="pt-14 md:pt-20"
    >
      <div className="reveal [--r1:18%]">
        <p className="flex items-center gap-3.5 text-xs font-semibold uppercase tracking-[0.16em]">
          <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-brand-gold" />
          <span>The board</span>
        </p>
      </div>
      <h2
        id="board-heading"
        className="reveal mt-5 max-w-2xl text-4xl font-semibold leading-[1.05] tracking-tight text-balance md:text-5xl [--r0:4%] [--r1:24%]"
      >
        The people running AnderTech.
      </h2>

      {board.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-dashed border-zinc-300 p-5 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
          Board list coming soon.
        </p>
      ) : (
        <>
          <p className="reveal mt-3 max-w-[52ch] text-lg leading-snug text-zinc-600 dark:text-zinc-400 [--r0:6%] [--r1:26%]">
            {board.length} students this year, across recruiting, learning,
            community, alumni and operations.
          </p>

          {boardPhoto && (
            <div className="reveal mt-8 overflow-hidden rounded-2xl shadow-sm ring-1 ring-zinc-900/10 dark:ring-white/10 [--r1:26%]">
              <Image
                src={boardPhoto.src}
                alt={boardPhoto.alt}
                width={boardPhoto.width}
                height={boardPhoto.height}
                sizes="(min-width: 1024px) 1024px, 100vw"
                className="h-auto w-full"
              />
            </div>
          )}

          <details className="group reveal mt-8 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm [--r1:20%] dark:border-zinc-800 dark:bg-zinc-900">
            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-blue [&::-webkit-details-marker]:hidden">
              <span>
                <span className="font-semibold">Meet the board</span>
                <span className="text-zinc-600 dark:text-zinc-400">
                  {" "}
                  · {board.length}
                </span>
              </span>
              <span
                aria-hidden="true"
                className="flex items-center gap-2 text-sm font-medium text-brand-blue dark:text-[#7dbbec]"
              >
                <span className="group-open:hidden">Show all</span>
                <span className="hidden group-open:inline">Hide</span>
                <svg
                  viewBox="0 0 16 16"
                  className="size-4 transition-transform group-open:rotate-180"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3.5 6l4.5 4.5L12.5 6" />
                </svg>
              </span>
            </summary>
            <ul className="grid gap-x-8 gap-y-4 border-t border-zinc-200 px-5 py-6 sm:grid-cols-2 lg:grid-cols-3 dark:border-zinc-800">
              {board.map((member) => (
                <li key={`${member.name}-${member.role}`}>
                  <p className="font-medium leading-snug">{member.name}</p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    {member.role}
                  </p>
                </li>
              ))}
            </ul>
          </details>
        </>
      )}
    </section>
  );
}
