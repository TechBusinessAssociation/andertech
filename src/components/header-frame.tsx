"use client";

import { usePathname } from "next/navigation";

// Only picks the header's width so the logo lines up with the page below it:
// narrow on the public site, wider on /members and /admin. It reads the URL,
// not the session, so pages stay statically rendered.
export function HeaderFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const width = pathname.startsWith("/admin")
    ? "max-w-6xl px-4 md:px-6"
    : pathname.startsWith("/members")
      ? "max-w-5xl px-5"
      : "max-w-2xl px-6";

  return (
    <div className={`mx-auto flex items-center justify-between py-4 ${width}`}>
      {children}
    </div>
  );
}
