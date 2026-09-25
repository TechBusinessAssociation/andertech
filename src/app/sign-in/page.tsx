import { signIn } from "@/auth";

type SignInPageProps = {
  searchParams: Promise<{ error?: string }>;
};

// Branded sign-in page (the site header above this still renders via the
// root layout). Also doubles as the Auth.js error page -- a denied
// sign-in redirects back here with ?error=AccessDenied.
export default async function SignInPage({ searchParams }: SignInPageProps) {
  const { error } = await searchParams;

  return (
    <main className="mx-auto flex max-w-2xl flex-1 flex-col items-start gap-6 px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">
        Members sign-in
      </h1>
      <p className="text-zinc-700 dark:text-zinc-300">
        Sign in with the Google account you&apos;re an AnderTech member
        under.
      </p>

      {error === "AccessDenied" && (
        <p className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
          That Google account isn&apos;t on the approved member list. If
          you think this is a mistake, contact the board.
        </p>
      )}

      <form
        action={async () => {
          "use server";
          await signIn("google", { redirectTo: "/members" });
        }}
      >
        <button
          type="submit"
          className="inline-flex min-h-12 w-fit items-center rounded-lg bg-brand-navy px-6 py-3 font-medium text-white hover:bg-brand-blue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-navy"
        >
          Sign in with Google
        </button>
      </form>
    </main>
  );
}
