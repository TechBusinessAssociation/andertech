import Link from "next/link";
import {
  AuthShell,
  authButtonPrimary,
  authInputClass,
  eyebrowClass,
} from "@/components/auth-shell";
import { site } from "../../../content/site";
import { requestAccessAction } from "./actions";

type Props = {
  searchParams: Promise<{ sent?: string; error?: string }>;
};

const domain = site.requestEmailDomain;

const ERRORS: Record<string, string> = {
  name: "Please enter your name.",
  email: `Please use your UCLA Google address, which ends in @${domain}.`,
  busy: "We can't take new requests right now. Please contact the board.",
  failed: "Something went wrong on our side. Please try again in a moment.",
};

export default async function RequestAccessPage({ searchParams }: Props) {
  const { sent, error } = await searchParams;
  const errorMessage = error ? ERRORS[error] : undefined;

  if (sent === "1") {
    return (
      <AuthShell labelledBy="request-heading">
        <div className="grid gap-2">
          <span className={eyebrowClass}>Request access</span>
          <h1
            id="request-heading"
            className="text-3xl font-semibold leading-tight tracking-tight text-balance"
          >
            Request received
          </h1>
          <p className="text-[15px] text-brand-navy/75 dark:text-white/75">
            Thanks. The board reviews requests, and once yours is approved you
            can sign in with that @{domain} Google account. If you are already
            a member, you can sign in now.
          </p>
        </div>
        <Link href="/sign-in" className={authButtonPrimary}>
          Go to sign in
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell labelledBy="request-heading">

      <div className="grid gap-2">
        <span className={eyebrowClass}>Request access</span>
        <h1
          id="request-heading"
          className="text-3xl font-semibold leading-tight tracking-tight text-balance"
        >
          Request an AnderTech account
        </h1>
        <p className="text-[15px] text-brand-navy/75 dark:text-white/75">
          Enter your UCLA Google address (it ends in @{domain}). The board
          reviews each request, and once you are approved you sign in with that
          account.
        </p>
      </div>

      {errorMessage && (
        <p
          role="alert"
          className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200"
        >
          {errorMessage}
        </p>
      )}

      <form action={requestAccessAction} className="grid gap-4">
        <label className="grid gap-1.5 text-sm font-medium">
          Full name
          <input
            name="name"
            type="text"
            required
            maxLength={100}
            autoComplete="name"
            placeholder="Jane Doe"
            className={authInputClass}
          />
        </label>
        <label className="grid gap-1.5 text-sm font-medium">
          UCLA email
          <input
            name="email"
            type="email"
            required
            maxLength={100}
            autoComplete="email"
            inputMode="email"
            placeholder={`yourname@${domain}`}
            className={authInputClass}
          />
        </label>

        {/* Honeypot: invisible to people, tempting to bots. Filled in = ignored. */}
        <div
          aria-hidden="true"
          className="absolute -left-[9999px] h-0 w-0 overflow-hidden"
        >
          <label>
            Company
            <input name="company" type="text" tabIndex={-1} autoComplete="off" />
          </label>
        </div>

        <button type="submit" className={authButtonPrimary}>
          Send request
        </button>
      </form>

      <p className="text-sm text-brand-navy/75 dark:text-white/75">
        Already a member?{" "}
        <Link
          href="/sign-in"
          className="font-semibold text-brand-blue underline dark:text-[#7dbbec]"
        >
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
