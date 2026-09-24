import { board } from "../../content/board";

// Renders content/board.ts. Empty array -> a "coming soon" placeholder,
// so this is safe to ship even before the board list is finalized.
export function BoardSection() {
  return (
    <section aria-labelledby="board-heading" className="border-t border-zinc-200 px-6 py-12 dark:border-zinc-800">
      <div className="mx-auto max-w-2xl">
        <h2 id="board-heading" className="text-2xl font-semibold tracking-tight">
          Board
        </h2>
        {board.length > 0 ? (
          <ul className="mt-6 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
            {board.map((member) => (
              <li key={member.name}>
                <p className="font-medium">{member.name}</p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">{member.role}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-zinc-600 dark:text-zinc-400">Board list coming soon.</p>
        )}
      </div>
    </section>
  );
}
