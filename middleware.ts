import NextAuth from "next-auth";
import { NextResponse, type NextRequest } from "next/server";
import { authConfig } from "@/auth.config";

// Deliberately builds its own auth() from the Edge-safe base config
// (auth.config.ts), NOT from "@/auth" -- that file's signIn callback
// references the members database (src/lib/members-db.ts), and no
// database client should ever end up in middleware's Edge bundle. This
// was a real, verified problem with an earlier Node-only dependency
// here (see CLAUDE.md's Auth section): merely importing a module that
// references Node's `crypto` crashes at module-evaluation time on the
// Edge runtime, even if the function is never called. Keeping this file
// scoped to auth.config.ts only avoids that class of bug regardless of
// what the membership check happens to depend on later.
//
// This makes middleware a cheap, Edge-safe first gate for both
// /members and /admin: is there a valid Google-authenticated session at
// all? The real checks (still an approved member; also an admin) run in
// each page itself instead, which always runs on the Node.js runtime.
const { auth } = NextAuth(authConfig);

function denied(request: NextRequest) {
  return NextResponse.redirect(new URL("/sign-in", request.url));
}

export default async function middleware(request: NextRequest) {
  if (!process.env.AUTH_SECRET) {
    // Fail closed on missing config too -- see the file-level note above
    // about not trusting Auth.js's own error handling for this. Verified
    // locally: without an explicit check, a missing AUTH_SECRET makes
    // Auth.js log an internal error and otherwise let the request
    // through untouched.
    return denied(request);
  }

  try {
    const session = await auth();
    if (session?.user?.email) {
      return NextResponse.next();
    }
  } catch {
    // Any failure here denies access -- never fails open.
  }

  return denied(request);
}

export const config = {
  matcher: ["/members/:path*", "/admin/:path*"],
};
