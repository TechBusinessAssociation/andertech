import { auth } from "@/auth";
import { isAdmin } from "@/lib/admin";

// Tells the site header what to show: "Login" or "Members", and whether to add
// the "Admin console" link. The header can't read the session itself without
// making every public page render per request, so it asks this endpoint from
// the browser after the page loads. It only ever reports the caller's own
// status, and the /members and /admin pages check permission again on their
// own -- this is a convenience for the links, not the gate.
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  const email = session?.user?.email;
  const signedIn = Boolean(email);
  const admin = email ? await isAdmin(email) : false;

  return Response.json(
    { signedIn, admin },
    { headers: { "Cache-Control": "no-store" } },
  );
}
