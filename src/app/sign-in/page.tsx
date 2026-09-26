import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signIn, signOut } from "@/auth";
import { HeroBand } from "@/components/hero-band";
import { IconTile } from "@/components/icons";
import { isAdmin } from "@/lib/admin";
import { isApprovedMember } from "@/lib/members-db";
import { site } from "../../../content/site";

type SignInPageProps = {
  searchParams: Promise<{ error?: string }>;
};

// Google's "G" mark, as used on sign-in buttons.
function GoogleG() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className="h-5 w-5 shrink-0">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}

const cardButton =
  "inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-xl border px-5 text-[15px] font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue";

// Branded sign-in page (the site header above it still renders via the root
// layout). It also doubles as the Auth.js error page: a denied sign-in
// redirects back here with ?error=AccessDenied.
export default async function SignInPage({ searchParams }: SignInPageProps) {
  const { error } = await searchParams;

  const session = await auth();
  const email = session?.user?.email ?? null;

  // Already signed in as an approved member: nothing to do here. (The same
  // test /members applies, so this can never bounce back and forth with it.)
  if (email && (await isApprovedMember(email))) {
    redirect("/members");
  }
  // Signed in but not on the member list -- an ADMIN_EMAILS admin who hasn't
  // added themselves yet, or someone removed since they signed in.
  const admin = email ? await isAdmin(email) : false;

  const contactHref = site.contactEmail
    ? `mailto:${site.contactEmail}?subject=${encodeURIComponent(`${site.feedbackSubject}: `)}`
    : null;

  return (
    <main className="flex flex-1 flex-col">
      <HeroBand labelledBy="signin-heading" className="flex flex-1 items-center">
        <div className="mx-auto w-full max-w-5xl px-5 py-10 md:py-16">
          <div className="mx-auto grid w-full max-w-md gap-5 rounded-2xl border border-white/70 bg-white/85 p-6 text-brand-navy shadow-sm backdrop-blur-sm md:p-8 dark:border-white/10 dark:bg-zinc-900/85 dark:text-zinc-100">
            <IconTile name="people" />

            <div className="grid gap-2">
              <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-brand-navy/70 before:h-0.5 before:w-[22px] before:bg-brand-gold before:content-[''] dark:text-white/70">
                Members
              </span>
              <h1
                id="signin-heading"
                className="text-3xl font-semibold leading-tight tracking-tight text-balance"
              >
                {email ? "You're signed in" : "Sign in to AnderTech"}
              </h1>
              <p className="text-[15px] text-brand-navy/75 dark:text-white/75">
                {email
                  ? `Signed in as ${email}, which isn't on the member list.`
                  : "Use the Google account you're an AnderTech member under."}
              </p>
            </div>

            {error === "AccessDenied" && (
              <p
                role="alert"
                className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200"
              >
                That Google account isn&apos;t on the approved member list.{" "}
                {contactHref ? (
                  <>
                    If you think this is a mistake,{" "}
                    <a href={contactHref} className="font-medium underline">
                      contact the board
                    </a>
                    .
                  </>
                ) : (
                  "If you think this is a mistake, contact the board."
                )}
              </p>
            )}

            {email ? (
              <div className="grid gap-3">
                {admin && (
                  <Link
                    href="/admin"
                    className={`${cardButton} border-transparent bg-brand-navy text-white hover:bg-brand-blue dark:bg-brand-gold dark:text-brand-navy dark:hover:brightness-105`}
                  >
                    Open the admin console
                  </Link>
                )}
                <form
                  action={async () => {
                    "use server";
                    await signOut({ redirectTo: "/sign-in" });
                  }}
                >
                  <button
                    type="submit"
                    className={`${cardButton} border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800`}
                  >
                    Sign out and use another account
                  </button>
                </form>
              </div>
            ) : (
              <form
                action={async () => {
                  "use server";
                  await signIn("google", { redirectTo: "/members" });
                }}
              >
                <button
                  type="submit"
                  className={`${cardButton} border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800`}
                >
                  <GoogleG />
                  Sign in with Google
                </button>
              </form>
            )}

            <p className="text-[13px] text-brand-navy/65 dark:text-white/65">
              Members get upcoming events, guides and recruiting resources in
              one place.
            </p>
          </div>

          <p className="mt-5 text-center">
            <Link
              href="/"
              className="inline-flex min-h-11 items-center text-sm font-medium text-brand-blue hover:underline dark:text-[#7dbbec]"
            >
              &larr; Back to home
            </Link>
          </p>
        </div>
      </HeroBand>
    </main>
  );
}
