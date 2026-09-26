"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  addEvent,
  removeEvent,
  updateEvent,
  type EventInput,
} from "@/lib/members-db";
import { requireAdmin } from "@/lib/require-admin";
import { backTo, toInt } from "../helpers";

const SECTION = "/admin/events";

function refresh() {
  revalidatePath(SECTION);
  revalidatePath("/members/events");
}

function eventInputFrom(formData: FormData): EventInput {
  const field = (name: string) => String(formData.get(name) ?? "");
  return {
    title: field("title"),
    category: field("category"),
    eventDate: field("event_date"),
    startTime: field("start_time"),
    endTime: field("end_time"),
    location: field("location"),
    description: field("description"),
    url: field("url"),
  };
}

export async function saveEventAction(formData: FormData) {
  await requireAdmin();

  const input = eventInputFrom(formData);
  const rawId = formData.get("id");
  const saved = rawId
    ? await updateEvent(toInt(rawId), input)
    : await addEvent(input);

  refresh();
  redirect(saved ? SECTION : `${SECTION}?notice=invalid`);
}

export async function removeEventAction(formData: FormData) {
  await requireAdmin();

  await removeEvent(toInt(formData.get("id")));

  refresh();
  redirect(backTo(formData, SECTION));
}
