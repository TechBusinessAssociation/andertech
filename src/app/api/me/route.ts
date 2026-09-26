import { auth } from "@/auth";
import { isAdmin } from "@/lib/admin";

// Tells the site header whether to show the "Admin console" link. The header
// can't read the session itself without making every public page render per
// request, so it asks this endpoint from the browser after the page loads.
// It only ever reports the caller's own status, and the /admin pages check
// permission again on their own -- this is a convenience for the link, not the
// gate.
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  const email = session?.user?.email;
  const admin = email ? await isAdmin(email) : false;

  return Response.json({ admin }, { headers: { "Cache-Control": "no-store" } });
}
