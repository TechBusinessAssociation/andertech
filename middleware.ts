import NextAuth from "next-auth";
import { NextResponse, type NextRequest } from "next/server";
import { authConfig } from "@/auth.config";

// Deliberately builds its own auth() from the Edge-safe base config
// (auth.config.ts), NOT from "@/auth" -- that file's signIn callback
// references @azure/msal-node (via isApprovedMember), which needs
// Node's `crypto`. The Edge runtime can't load that: merely importing a
// module that references it crashes at module-evaluation time, even if
// the function is never called. Verified locally via next start:
// "Failed to load external module node:crypto" when middleware.ts
// imported from "@/auth" instead of this Edge-safe config directly.
//
// This makes middleware a cheap, Edge-safe first gate: is there a valid
// Google-authenticated session at all? The live "is this email still an
// approved member right now" re-check (the 24h/60s cache policy) runs in
// src/app/members/page.tsx instead, which always runs on the Node.js
// runtime and can safely import members-workbook.ts.
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
  matcher: ["/members/:path*"],
};
