"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isEnvAdminEmail } from "@/lib/admin";
import { addMembers, removeMember, setMemberRoles } from "@/lib/members-db";
import { requireAdmin } from "@/lib/require-admin";
import { cleanRoles } from "@/lib/roles";
import { backTo } from "../helpers";

const SECTION = "/admin/members";

export async function addMembersAction(formData: FormData) {
  await requireAdmin();

  const emails = String(formData.get("emails") ?? "").split(/[\s,;]+/);
  const roles = cleanRoles(formData.getAll("roles").map(String));
  const count = await addMembers(emails, roles);

  revalidatePath(SECTION);
  if (count === 0) {
    redirect(backTo(formData, SECTION, { notice: "no-emails" }));
  }
  redirect(SECTION + `?notice=added&count=${count}`);
}

export async function removeMemberAction(formData: FormData) {
  const actor = await requireAdmin();

  const target = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  if (target === actor) {
    redirect(backTo(formData, SECTION, { notice: "cannot-remove-self" }));
  }
  await removeMember(target);

  revalidatePath(SECTION);
  redirect(backTo(formData, SECTION));
}

export async function setRolesAction(formData: FormData) {
  const actor = await requireAdmin();

  const target = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const roles = cleanRoles(formData.getAll("roles").map(String));

  // An admin who is only an admin through the database could otherwise strip
  // their own access mid-session. ADMIN_EMAILS admins can't lose it anyway.
  if (
    target === actor &&
    !roles.includes("admin") &&
    !isEnvAdminEmail(actor)
  ) {
    redirect(backTo(formData, SECTION, { notice: "cannot-demote-self" }));
  }
  await setMemberRoles(target, roles);

  revalidatePath(SECTION);
  redirect(backTo(formData, SECTION));
}
