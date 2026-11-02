import { auth } from "@/auth";
import { isAdmin, isNewsletterAdmin } from "@/lib/admin";

// Tells the site header what to show: "Sign in" or the account menu, and whether to
// add the "Admin console" entry (for full admins and newsletter editors). The header
// can't read the session itself without making every public page render per
// request, so it asks this endpoint from the browser after the page loads. It
// only ever reports the caller's own status, and the /members and /admin pages
// check permission again on their own -- this is a convenience for the links,
// not the gate.
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  const email = session?.user?.email;
  const signedIn = Boolean(email);
  const admin = email ? await isAdmin(email) : false;
  const newsletterAdmin = email ? await isNewsletterAdmin(email) : false;

  // The Google account name (the caller's own) only draws the initials on the
  // header's account button.
  const name = session?.user?.name ?? null;

  return Response.json(
    { signedIn, admin, newsletterAdmin, name },
    { headers: { "Cache-Control": "no-store" } },
  );
}
