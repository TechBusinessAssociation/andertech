import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { isApprovedMember } from "@/lib/members-db";
import { isEnvAdminEmail } from "@/lib/admin";

// Full config: the Edge-safe base (auth.config.ts) plus the membership
// check. Kept out of auth.config.ts (and so out of middleware.ts, which
// only imports that file) so a database dependency here can never end
// up in middleware's Edge bundle -- see auth.config.ts and
// middleware.ts's comments for why that split exists at all.
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  callbacks: {
    // Denies at login time, with a clear message, rather than letting a
    // non-member reach /members and immediately get bounced there.
    // /members itself still re-checks on every load (see its comment) --
    // this isn't the only check, just the first one.
    //
    // Emails in ADMIN_EMAILS bypass the members check here on purpose: the
    // members table starts empty, and /admin (where an admin would add people
    // to it, including themselves) is only reachable by signing in first.
    // Without this, nobody could ever bootstrap the member list at all.
    // Admins granted the role in the database are members already, so they
    // pass the normal check below.
    async signIn({ user }) {
      if (isEnvAdminEmail(user.email)) return true;
      return await isApprovedMember(user.email);
    },
  },
});
