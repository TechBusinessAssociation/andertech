import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/admin";

// The one admin check. Call it at the top of every /admin page AND every
// admin server action: layouts don't re-render on client navigation, and
// server actions are reachable by direct POST, so neither the layout nor
// middleware (which only confirms "some signed-in session") is enough.
// Returns the signed-in admin's normalized email.
export async function requireAdmin(): Promise<string> {
  const session = await auth();
  const email = session?.user?.email?.trim().toLowerCase();

  if (!email || !(await isAdmin(email))) {
    redirect("/sign-in");
  }
  return email;
}
