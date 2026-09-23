import Link from "next/link";
import { Logo } from "./logo";
import { site } from "../../content/site";

// Simple site header. Kept on a fixed white plate (not dark-mode aware) --
// the logo's own colors are the brand, and a fixed light background keeps
// it readable without needing a separate dark-mode version of the logo.
export function Header() {
  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-2xl items-center px-6 py-4">
        <Link href="/" aria-label={site.name}>
          <Logo className="h-9 w-auto" />
        </Link>
      </div>
    </header>
  );
}
