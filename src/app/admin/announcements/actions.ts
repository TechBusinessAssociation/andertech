"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  addAnnouncement,
  removeAnnouncement,
  updateAnnouncement,
  type AnnouncementInput,
} from "@/lib/members-db";
import { requireAdmin } from "@/lib/require-admin";
import { backTo, toInt } from "../helpers";

const SECTION = "/admin/announcements";

function refresh() {
  revalidatePath(SECTION);
  revalidatePath("/members");
}

function inputFrom(formData: FormData): AnnouncementInput {
  const field = (name: string) => String(formData.get(name) ?? "");
  return { title: field("title"), body: field("body"), url: field("url") };
}

export async function saveAnnouncementAction(formData: FormData) {
  await requireAdmin();

  const input = inputFrom(formData);
  const rawId = formData.get("id");
  const saved = rawId
    ? await updateAnnouncement(toInt(rawId), input)
    : await addAnnouncement(input);

  refresh();
  redirect(saved ? SECTION : `${SECTION}?notice=invalid`);
}

export async function removeAnnouncementAction(formData: FormData) {
  await requireAdmin();

  await removeAnnouncement(toInt(formData.get("id")));

  refresh();
  redirect(backTo(formData, SECTION));
}
