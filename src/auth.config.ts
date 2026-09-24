import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

// Edge-safe base config -- deliberately has NO reference to
// isApprovedMember/@azure/msal-node (see src/lib/members-workbook.ts).
// That import chain needs Node's `crypto` module, which the Edge runtime
// can't load: merely importing a module that references it crashes at
// module-evaluation time, even if the function is never called, so it
// must not be reachable from anything middleware.ts imports.
//
// middleware.ts imports auth() from THIS file (via auth.ts re-exporting
// it) to do the cheap "is there a session at all" check. The real,
// live membership check runs in src/app/members/page.tsx instead
// (Node.js runtime, unaffected) -- see that file's comment.
export const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  session: { strategy: "jwt" },
  pages: { error: "/sign-in" },
  // Trust the incoming Host header -- needed behind any reverse proxy
  // (Vercel included). Verified locally: without this, `next start`
  // logs UntrustedHost and treats every request as session-less.
  trustHost: true,
};
