"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { approveRequest, rejectRequest } from "@/lib/access-requests";
import { requireAdmin } from "@/lib/require-admin";
import { toInt } from "../helpers";

// The whole /admin layout is revalidated too: its menu shows the pending count
// and layouts are not re-rendered on client navigation.
function refresh() {
  revalidatePath("/admin/requests");
  revalidatePath("/admin/members");
  revalidatePath("/admin", "layout");
}

export async function approveRequestAction(formData: FormData) {
  const actor = await requireAdmin();

  await approveRequest(toInt(formData.get("id")), actor);

  refresh();
  redirect("/admin/requests?notice=approved");
}

export async function rejectRequestAction(formData: FormData) {
  const actor = await requireAdmin();

  await rejectRequest(toInt(formData.get("id")), actor);

  refresh();
  redirect("/admin/requests?notice=rejected");
}
