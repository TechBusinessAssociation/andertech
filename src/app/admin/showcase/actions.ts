"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  addShowcasePost,
  removeShowcasePost,
  updateShowcasePost,
  type ShowcasePostInput,
} from "@/lib/members-db";
import { requireAdmin } from "@/lib/require-admin";
import { backTo, toInt } from "../helpers";

const SECTION = "/admin/showcase";

function refresh() {
  revalidatePath(SECTION);
  revalidatePath("/members");
}

function inputFrom(formData: FormData): ShowcasePostInput {
  const field = (name: string) => String(formData.get(name) ?? "");
  return {
    title: field("title"),
    description: field("description"),
    memberName: field("memberName"),
    url: field("url"),
  };
}

export async function saveShowcasePostAction(formData: FormData) {
  await requireAdmin();

  const input = inputFrom(formData);
  const rawId = formData.get("id");
  const saved = rawId
    ? await updateShowcasePost(toInt(rawId), input)
    : await addShowcasePost(input);

  refresh();
  redirect(saved ? SECTION : `${SECTION}?notice=invalid`);
}

export async function removeShowcasePostAction(formData: FormData) {
  await requireAdmin();

  await removeShowcasePost(toInt(formData.get("id")));

  refresh();
  redirect(backTo(formData, SECTION));
}
