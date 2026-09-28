import Link from "next/link";
import { HeaderActions } from "./header-actions";
import { HeaderFrame } from "./header-frame";
import { Logo } from "./logo";
import { site } from "../../content/site";

// Simple site header. Kept on a fixed white plate (not dark-mode aware) --
// the logo's own colors are the brand, and a fixed light background keeps
// it readable without needing a separate dark-mode version of the logo.
// Sticky so it stays visible while scrolling; z-20 keeps it above page
// content (e.g. the "What we do" section's background grid) without
// needing to sit above the account-menu dropdown, which is inside the
// header itself and so always stacks above it regardless.
//
// Shown on every page, including public ones. Do NOT read the session
// (auth(), cookies(), headers()) in here: this sits in the root layout, so
// doing so makes every page -- including the public landing page -- render
// on each request instead of being served as static files from the CDN.
// Anything that depends on who is signed in (the Admin console link) is
// fetched by the browser afterwards, in <HeaderActions />.
export function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white">
      <HeaderFrame>
        <Link href="/" aria-label={site.name} className="shrink-0">
          <Logo className="h-7 w-auto min-[380px]:h-8 sm:h-9" />
        </Link>

        <HeaderActions />
      </HeaderFrame>
    </header>
  );
}
