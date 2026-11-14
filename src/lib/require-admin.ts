import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { isAdmin, isNewsletterAdmin, isRecruitingEditor } from "@/lib/admin";
import { ADMIN_SECTIONS, type Section } from "@/lib/tab-sections";

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

// Same rule for the newsletter section only: full admins and members with the
// 'newsletter_admin' role. Every /admin/newsletter page and action calls this
// (never requireAdmin, which would lock editors out) -- and no other section
// may, or an editor could reach it.
export async function requireNewsletterAdmin(): Promise<string> {
  const session = await auth();
  const email = session?.user?.email?.trim().toLowerCase();

  if (!email || !(await isNewsletterAdmin(email))) {
    redirect("/sign-in");
  }
  return email;
}

// For /admin/categories and /admin/resources: full admins get every tab's
// rows; members with 'recruiting_editor' get only the Recruiting tab's. Every
// page and action there calls this and then must keep to `sections` -- for
// a save, both the row's current tab and the tab it is moving to (see
// assertSections in those actions).
export async function requireResourceEditor(): Promise<{
  email: string;
  sections: readonly Section[];
}> {
  const session = await auth();
  const email = session?.user?.email?.trim().toLowerCase();
  if (!email) redirect("/sign-in");

  if (await isAdmin(email)) return { email, sections: ADMIN_SECTIONS };
  if (await isRecruitingEditor(email)) {
    return { email, sections: ["recruiting"] };
  }
  redirect("/sign-in");
}

// For the /admin layout, which only draws the sidebar: lets in anyone who may
// use at least one section and says which, so the menu shows only what they can
// open. Not a security boundary (each page checks for itself).
export async function getAdminAccess(): Promise<{
  email: string;
  admin: boolean;
  newsletter: boolean;
  recruiting: boolean;
}> {
  const session = await auth();
  const email = session?.user?.email?.trim().toLowerCase();
  if (!email) redirect("/sign-in");

  const admin = await isAdmin(email);
  const newsletter = admin || (await isNewsletterAdmin(email));
  const recruiting = admin || (await isRecruitingEditor(email));
  if (!newsletter && !recruiting) redirect("/sign-in");

  return { email, admin, newsletter, recruiting };
}
