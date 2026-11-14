"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { readHighlight } from "@/lib/highlights";
import {
  addResource,
  checkHighlightSlot,
  getCategorySection,
  getResourceSection,
  removeResource,
  updateResource,
} from "@/lib/members-db";
import { requireResourceEditor } from "@/lib/require-admin";
import type { Section } from "@/lib/tab-sections";
import { toInt } from "../helpers";

function refresh() {
  revalidatePath("/admin/resources");
  revalidatePath("/admin/categories");
  revalidatePath("/members");
}

function fail(notice: string): never {
  redirect(`/admin/resources?notice=${notice}`);
}

// A recruiting editor may only touch Recruiting rows. Checked against the
// database (never the form), for both the row being edited and the category
// it is being saved into, so a forged id or category can't reach another tab.
function inScope(
  section: Section | null,
  sections: readonly Section[],
): section is Section {
  return section !== null && sections.includes(section);
}

export async function saveResourceAction(formData: FormData) {
  const { sections } = await requireResourceEditor();

  const categoryId = toInt(formData.get("category_id"), NaN);
  if (!Number.isFinite(categoryId)) fail("invalid");

  const section = await getCategorySection(categoryId);
  if (!inScope(section, sections)) fail("not-allowed");

  const rawId = formData.get("id");
  const id = rawId ? toInt(rawId) : null;
  if (id !== null && !inScope(await getResourceSection(id), sections)) {
    fail("not-allowed");
  }

  const highlight = readHighlight(formData);
  if (highlight === "invalid") fail("highlight-invalid");
  if (highlight) {
    const slot = await checkHighlightSlot(section, highlight.rank, id);
    if (slot === "full") fail("highlight-full");
    if (slot === "taken") fail("highlight-taken");
  }

  const input = {
    label: String(formData.get("label") ?? ""),
    url: String(formData.get("url") ?? ""),
    description: String(formData.get("description") ?? ""),
    categoryId,
    sortOrder: toInt(formData.get("sort_order")),
    highlight,
  };
  const saved =
    id !== null ? await updateResource(id, input) : await addResource(input);

  refresh();
  redirect(saved ? "/admin/resources" : "/admin/resources?notice=invalid");
}

export async function removeResourceAction(formData: FormData) {
  const { sections } = await requireResourceEditor();

  const id = toInt(formData.get("id"));
  if (!inScope(await getResourceSection(id), sections)) fail("not-allowed");

  await removeResource(id);

  refresh();
  redirect("/admin/resources");
}
