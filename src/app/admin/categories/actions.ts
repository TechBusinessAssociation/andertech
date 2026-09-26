"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  addCategory,
  removeCategory,
  updateCategory,
} from "@/lib/members-db";
import { requireAdmin } from "@/lib/require-admin";
import { toInt } from "../helpers";

function refresh() {
  revalidatePath("/admin/categories");
  revalidatePath("/admin/resources");
  revalidatePath("/members");
}

export async function saveCategoryAction(formData: FormData) {
  await requireAdmin();

  const name = String(formData.get("name") ?? "");
  const description = String(formData.get("description") ?? "");
  const sortOrder = toInt(formData.get("sort_order"));
  const rawId = formData.get("id");

  if (!name.trim()) {
    redirect("/admin/categories?notice=name-required");
  }
  if (rawId) {
    await updateCategory(toInt(rawId), name, description, sortOrder);
  } else {
    await addCategory(name, description, sortOrder);
  }

  refresh();
  redirect("/admin/categories");
}

export async function removeCategoryAction(formData: FormData) {
  await requireAdmin();

  const removed = await removeCategory(toInt(formData.get("id")));

  refresh();
  redirect(removed ? "/admin/categories" : "/admin/categories?notice=in-use");
}
