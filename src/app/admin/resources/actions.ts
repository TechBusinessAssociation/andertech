"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  addResource,
  removeResource,
  updateResource,
} from "@/lib/members-db";
import { requireAdmin } from "@/lib/require-admin";
import { toInt } from "../helpers";

function refresh() {
  revalidatePath("/admin/resources");
  revalidatePath("/admin/categories");
  revalidatePath("/members");
}

export async function saveResourceAction(formData: FormData) {
  await requireAdmin();

  const input = {
    label: String(formData.get("label") ?? ""),
    url: String(formData.get("url") ?? ""),
    description: String(formData.get("description") ?? ""),
    categoryId: toInt(formData.get("category_id"), NaN),
    sortOrder: toInt(formData.get("sort_order")),
  };
  const rawId = formData.get("id");

  const saved = Number.isFinite(input.categoryId)
    ? rawId
      ? await updateResource(toInt(rawId), input)
      : await addResource(input)
    : false;

  refresh();
  redirect(saved ? "/admin/resources" : "/admin/resources?notice=invalid");
}

export async function removeResourceAction(formData: FormData) {
  await requireAdmin();

  await removeResource(toInt(formData.get("id")));

  refresh();
  redirect("/admin/resources");
}
