"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { updateRecruitingPage } from "@/lib/members-db";
import { requireAdmin } from "@/lib/require-admin";

const SECTION = "/admin/recruiting";

export async function saveRecruitingPageAction(formData: FormData) {
  await requireAdmin();

  const field = (name: string) => String(formData.get(name) ?? "").trim();

  await updateRecruitingPage({
    dashboardUrl: field("dashboardUrl") || null,
    reportingUrl: field("reportingUrl") || null,
    inviteOfferUrl: field("inviteOfferUrl") || null,
    resumeBotUrl: field("resumeBotUrl") || null,
    coverLetterUrl: field("coverLetterUrl") || null,
    questionBankUrl: field("questionBankUrl") || null,
    playbooksUrl: field("playbooksUrl") || null,
  });

  revalidatePath(SECTION);
  revalidatePath("/members");
  redirect(`${SECTION}?notice=saved`);
}
