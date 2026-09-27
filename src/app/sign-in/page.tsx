import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signIn, signOut } from "@/auth";
import {
  AuthShell,
  authButtonNeutral,
  authButtonPrimary,
} from "@/components/auth-shell";
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
    <AuthShell labelledBy="signin-heading">

      <div className="grid gap-2">
        <h1
          id="signin-heading"
          className="text-3xl font-semibold leading-tight tracking-tight text-balance"
        >
          {email ? "You're signed in" : "Sign in"}
        </h1>
        {email && (
          <p className="text-[15px] text-brand-navy/75 dark:text-white/75">
            {`Signed in as ${email}, which isn't on the member list.`}
          </p>
        )}
      </div>

      {error === "AccessDenied" && (
        <p
          role="alert"
          className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200"
        >
          That Google account hasn&apos;t been approved for the website yet. If
          you&apos;re new here,{" "}
          <Link href="/request-access" className="font-medium underline">
            request access
          </Link>{" "}
          and the board will approve it. Otherwise try a different account
          below
          {contactHref ? (
            <>
              , or if you think this is a mistake,{" "}
              <a href={contactHref} className="font-medium underline">
                contact the board
              </a>
              .
            </>
          ) : (
            ", or if you think this is a mistake, contact the board."
          )}
        </p>
      )}

      {!email && (
        <div className="grid gap-2">
          <p className="text-sm text-brand-navy/75 dark:text-white/75">
            First-time visitors to this website need to register and request
            access with their @{site.requestEmailDomain} address.
          </p>
          <Link href="/request-access" className={authButtonPrimary}>
            Register
          </Link>
        </div>
      )}

      {email ? (
        <div className="grid gap-3">
          {admin && (
            <Link href="/admin" className={authButtonPrimary}>
              Open the admin console
            </Link>
          )}
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/sign-in" });
            }}
          >
            <button type="submit" className={authButtonNeutral}>
              Sign out and use another account
            </button>
          </form>
        </div>
      ) : (
        <form
          className="grid gap-2 border-t border-brand-navy/10 pt-5 dark:border-white/15"
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/members" });
          }}
        >
          <p className="text-sm text-brand-navy/75 dark:text-white/75">
            Sign in for returning users.
          </p>
          <button type="submit" className={authButtonNeutral}>
            <GoogleG />
            {error === "AccessDenied"
              ? "Try a different Google account"
              : "Sign in with Google"}
          </button>
        </form>
      )}
    </AuthShell>
  );
}
