import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { isApprovedMember } from "@/lib/members-workbook";

// Full config: the Edge-safe base (auth.config.ts) plus the membership
// check, which needs Node's `crypto` (via @azure/msal-node) and so can
// only be imported from Node.js-runtime code -- the API route handler,
// Server Components/pages, and Server Actions, never middleware.ts.
// See auth.config.ts and middleware.ts's comments for why.
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  callbacks: {
    // Denies at login time, with a clear message, rather than letting a
    // non-member reach /members and immediately get bounced there.
    // /members itself still re-checks on every load (see its comment) --
    // this isn't the only check, just the first one.
    async signIn({ user }) {
      return await isApprovedMember(user.email);
    },
  },
});
