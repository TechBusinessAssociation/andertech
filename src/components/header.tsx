import Link from "next/link";
import { HeaderFrame } from "./header-frame";
import { Logo } from "./logo";
import { site } from "../../content/site";

// Simple site header. Kept on a fixed white plate (not dark-mode aware) --
// the logo's own colors are the brand, and a fixed light background keeps
// it readable without needing a separate dark-mode version of the logo.
//
// Shown on every page, including public ones. Do NOT read the session
// (auth(), cookies(), headers()) in here: this sits in the root layout, so
// doing so makes every page -- including the public landing page -- render
// on each request instead of being served as static files from the CDN.
// The "Members" link works for everyone: /members sends signed-out visitors
// to /sign-in itself, and signed-in members straight through.
export function Header() {
  return (
    <header className="border-b border-zinc-200 bg-white">
      <HeaderFrame>
        <Link href="/" aria-label={site.name}>
          <Logo className="h-9 w-auto" />
        </Link>

        <Link
          href="/members"
          className="text-sm text-zinc-600 underline hover:text-zinc-900"
        >
          Members
        </Link>
      </HeaderFrame>
    </header>
  );
}
