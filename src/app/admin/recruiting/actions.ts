"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { updateRecruitingPage } from "@/lib/members-db";
import { requireAdmin } from "@/lib/require-admin";

const SECTION = "/admin/recruiting";

export async function saveRecruitingPageAction(formData: FormData) {
  await requireAdmin();

  const dashboardUrl = String(formData.get("dashboardUrl") ?? "").trim();

  await updateRecruitingPage({ dashboardUrl: dashboardUrl || null });

  revalidatePath(SECTION);
  revalidatePath("/members");
  redirect(`${SECTION}?notice=saved`);
}
