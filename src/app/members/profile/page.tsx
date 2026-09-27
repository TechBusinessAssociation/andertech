import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getMemberProfile, isApprovedMember } from "@/lib/members-db";
import { PROGRAMS } from "@/lib/programs";
import { updateProfileAction } from "./actions";

type Props = {
  searchParams: Promise<{ notice?: string }>;
};

const inputClass =
  "rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900";
const labelClass = "flex flex-col gap-1 text-sm font-medium";

// A member editing their own profile. Same live re-check pattern as
// /members and /admin: middleware only confirms a signed-in Google
// session, so this re-checks the membership list on every load.
export default async function ProfilePage({ searchParams }: Props) {
  const session = await auth();
  const email = session?.user?.email;

  if (!email || !(await isApprovedMember(email))) {
    redirect("/sign-in");
  }

  const { notice } = await searchParams;
  const profile = await getMemberProfile(email);
  const googleName = session?.user?.name?.trim() ?? null;

  return (
    <main className="flex-1">
      <div className="mx-auto max-w-2xl px-5 py-8 md:py-12">
        <Link
          href="/members"
          className="inline-flex min-h-11 items-center text-sm font-medium text-brand-navy/80 hover:underline dark:text-white/80"
        >
          &larr; Members
        </Link>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-balance md:text-4xl">
          Your profile
        </h1>
        <p className="mt-2 text-[15px] text-zinc-600 dark:text-zinc-400">
          {googleName
            ? `Signed in as ${googleName} (${email}).`
            : `Signed in as ${email}.`}
        </p>

        {notice === "saved" && (
          <p
            role="status"
            className="mt-5 rounded-xl border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200"
          >
            Saved.
          </p>
        )}

        <form action={updateProfileAction} className="mt-6 grid gap-4">
          <label className={labelClass}>
            Display name
            <input
              name="displayName"
              type="text"
              maxLength={100}
              defaultValue={profile.displayName ?? ""}
              placeholder={googleName ?? "Jane Doe"}
              className={inputClass}
            />
            <span className="text-xs font-normal text-zinc-500 dark:text-zinc-400">
              Shown on the members home page. Leave blank to use your Google
              account name.
            </span>
          </label>

          <label className={labelClass}>
            Graduation year
            <input
              name="gradYear"
              type="number"
              inputMode="numeric"
              min={2000}
              max={2100}
              defaultValue={profile.gradYear ?? ""}
              placeholder="2027"
              className={`${inputClass} font-normal`}
            />
          </label>

          <label className={labelClass}>
            Program
            <select
              name="program"
              defaultValue={profile.program ?? ""}
              className={`${inputClass} font-normal`}
            >
              <option value="">Prefer not to say</option>
              {PROGRAMS.map((program) => (
                <option key={program} value={program}>
                  {program}
                </option>
              ))}
            </select>
          </label>

          <button
            type="submit"
            className="mt-1 inline-flex w-fit min-h-11 items-center rounded-full bg-brand-navy px-6 text-sm font-semibold text-white hover:bg-brand-blue dark:bg-brand-gold dark:text-brand-navy dark:hover:brightness-105"
          >
            Save
          </button>
        </form>
      </div>
    </main>
  );
}
