"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  addCategory,
  getCategorySection,
  removeCategory,
  updateCategory,
} from "@/lib/members-db";
import { requireResourceEditor } from "@/lib/require-admin";
import { isSection } from "@/lib/tab-sections";
import { toInt } from "../helpers";

function refresh() {
  revalidatePath("/admin/categories");
  revalidatePath("/admin/resources");
  revalidatePath("/members");
}

// A recruiting editor may only touch Recruiting categories: both the tab a
// category is saved into and, when editing, the tab it is in now (read from
// the database, never the form).
export async function saveCategoryAction(formData: FormData) {
  const { sections } = await requireResourceEditor();

  const name = String(formData.get("name") ?? "");
  const description = String(formData.get("description") ?? "");
  const sortOrder = toInt(formData.get("sort_order"));
  const rawSection = String(formData.get("section") ?? "");
  const section = isSection(rawSection) && rawSection !== "showcase" ? rawSection : "recruiting";
  const rawId = formData.get("id");

  const current = rawId ? await getCategorySection(toInt(rawId)) : section;
  if (!sections.includes(section) || !current || !sections.includes(current)) {
    redirect("/admin/categories?notice=not-allowed");
  }
  if (!name.trim()) {
    redirect("/admin/categories?notice=name-required");
  }
  if (rawId) {
    await updateCategory(toInt(rawId), name, description, sortOrder, section);
  } else {
    await addCategory(name, description, sortOrder, section);
  }

  refresh();
  redirect("/admin/categories");
}

export async function removeCategoryAction(formData: FormData) {
  const { sections } = await requireResourceEditor();

  const id = toInt(formData.get("id"));
  const current = await getCategorySection(id);
  if (!current || !sections.includes(current)) {
    redirect("/admin/categories?notice=not-allowed");
  }
  const removed = await removeCategory(id);

  refresh();
  redirect(removed ? "/admin/categories" : "/admin/categories?notice=in-use");
}
