import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

// Edge-safe base config -- deliberately has NO reference to
// isApprovedMember or the members database (src/lib/members-db.ts).
// A DB client can need Node-only APIs (Node's `crypto` module, in a
// dependency this project hit earlier -- see CLAUDE.md's Auth section),
// which the Edge runtime can't load: merely importing a module that
// references it crashes at module-evaluation time, even if the
// function is never called. So nothing DB-related may be reachable
// from anything middleware.ts imports.
//
// middleware.ts builds its own NextAuth(authConfig) directly from this
// file for the cheap "is there a session at all" check. The real, live
// membership/admin checks run in each page instead (Node.js runtime,
// unaffected) -- see src/app/members/page.tsx and
// src/app/admin/page.tsx.
export const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      // Always show Google's account chooser. Without this, someone signed in
      // to Google as a personal account is silently signed in with it, and
      // has no way to pick the account they are actually a member under.
      authorization: { params: { prompt: "select_account" } },
    }),
  ],
  session: { strategy: "jwt" },
  pages: { error: "/sign-in" },
  // Trust the incoming Host header -- needed behind any reverse proxy
  // (Vercel included). Verified locally: without this, `next start`
  // logs UntrustedHost and treats every request as session-less.
  trustHost: true,
};
