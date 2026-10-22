import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { isApprovedMember } from "@/lib/members-db";
import {
  MAX_DESCRIPTION_WORDS,
  MAX_PROJECTS_PER_MEMBER,
  MAX_TITLE_CHARS,
} from "@/lib/showcase";
import { getMyProjects } from "@/lib/showcase-db";
import {
  addProjectAction,
  deleteProjectAction,
  updateProjectAction,
} from "./actions";

type Props = {
  searchParams: Promise<{ notice?: string; error?: string; edit?: string }>;
};

const inputClass =
  "rounded-lg border border-zinc-300 px-3 py-2 text-sm font-normal dark:border-zinc-700 dark:bg-zinc-900";
const labelClass = "flex flex-col gap-1 text-sm font-medium";
const hintClass = "text-xs font-normal text-zinc-500 dark:text-zinc-400";

const ERRORS: Record<string, string> = {
  title: `Add a title of ${MAX_TITLE_CHARS} characters or fewer.`,
  url: "Add a link that starts with http:// or https://.",
  words: `Keep the description to ${MAX_DESCRIPTION_WORDS} words or fewer.`,
  cap: `You can share up to ${MAX_PROJECTS_PER_MEMBER} projects. Delete one to add another.`,
  missing: "That project couldn't be found.",
};

// A member managing their own showcase projects. Same live re-check as
// /members/profile: middleware only confirms a signed-in session.
export default async function ProjectsPage({ searchParams }: Props) {
  const session = await auth();
  const email = session?.user?.email;

  if (!email || !(await isApprovedMember(email))) {
    redirect("/sign-in");
  }

  const { notice, error, edit } = await searchParams;
  const projects = await getMyProjects(email);
  const editing = projects.find((p) => p.id === Number(edit)) ?? null;
  const atCap = projects.length >= MAX_PROJECTS_PER_MEMBER;

  return (
    <main className="flex-1">
      <div className="mx-auto max-w-2xl px-5 py-8 md:py-12">
        <Link
          href="/members/profile"
          className="inline-flex min-h-11 items-center text-sm font-medium text-brand-navy/80 hover:underline dark:text-white/80"
        >
          &larr; Your profile
        </Link>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-balance md:text-4xl">
          Your showcase projects
        </h1>
        <p className="mt-2 text-[15px] text-zinc-600 dark:text-zinc-400">
          Share something you built or a portfolio. It appears right away on
          the AnderTech Showcase tab, under {" "}
          <Link href="/members/profile" className="underline">
            your display name
          </Link>
          . Up to {MAX_PROJECTS_PER_MEMBER} projects.
        </p>

        {notice === "saved" && (
          <p
            role="status"
            className="mt-5 rounded-xl border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200"
          >
            Saved.
          </p>
        )}
        {error && ERRORS[error] && (
          <p
            role="alert"
            className="mt-5 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200"
          >
            {ERRORS[error]}
          </p>
        )}

        {projects.length > 0 && (
          <ul className="mt-6 divide-y divide-zinc-200 rounded-2xl border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">
            {projects.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between gap-3 px-4 py-3"
              >
                <p className="min-w-0 truncate font-medium">{p.title}</p>
                <div className="flex shrink-0 items-center gap-2">
                  <Link
                    href={`/members/profile/projects?edit=${p.id}`}
                    className="inline-flex min-h-11 items-center rounded-lg px-3 text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    Edit
                  </Link>
                  <form action={deleteProjectAction}>
                    <input type="hidden" name="id" value={p.id} />
                    <button
                      type="submit"
                      className="min-h-11 rounded-lg px-3 text-sm font-medium text-red-700 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-950"
                    >
                      Delete
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}

        {atCap && !editing ? (
          <p className="mt-6 text-sm text-zinc-600 dark:text-zinc-400">
            You&apos;ve reached {MAX_PROJECTS_PER_MEMBER} projects. Delete one
            to add another.
          </p>
        ) : (
          <form
            action={editing ? updateProjectAction : addProjectAction}
            // Remount when switching between add and edit so the fields reset.
            key={editing?.id ?? "new"}
            className="mt-8 grid gap-4"
          >
            <h2 className="text-xl font-semibold">
              {editing ? "Edit project" : "Add a project"}
            </h2>
            {editing && <input type="hidden" name="id" value={editing.id} />}

            <label className={labelClass}>
              Title
              <input
                name="title"
                type="text"
                required
                maxLength={MAX_TITLE_CHARS}
                defaultValue={editing?.title ?? ""}
                className={inputClass}
              />
              <span className={hintClass}>
                Up to {MAX_TITLE_CHARS} characters.
              </span>
            </label>

            <label className={labelClass}>
              Link
              <input
                name="url"
                type="url"
                required
                defaultValue={editing?.url ?? ""}
                placeholder="https://..."
                className={inputClass}
              />
              <span className={hintClass}>
                Opens in a new tab: a portfolio, a demo or the product itself.
              </span>
            </label>

            <label className={labelClass}>
              Description (optional)
              <textarea
                name="description"
                rows={6}
                defaultValue={editing?.description ?? ""}
                className={inputClass}
              />
              <span className={hintClass}>
                Up to {MAX_DESCRIPTION_WORDS} words. Shown when someone clicks
                your project to expand it.
              </span>
            </label>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                className="inline-flex min-h-11 items-center rounded-full bg-brand-navy px-6 text-sm font-semibold text-white hover:bg-brand-blue dark:bg-brand-gold dark:text-brand-navy dark:hover:brightness-105"
              >
                {editing ? "Save changes" : "Add project"}
              </button>
              {editing && (
                <Link
                  href="/members/profile/projects"
                  className="inline-flex min-h-11 items-center text-sm font-medium hover:underline"
                >
                  Cancel
                </Link>
              )}
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
