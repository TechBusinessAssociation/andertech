"use server";

import { redirect } from "next/navigation";
import {
  cleanRequestName,
  normalizeRequestEmail,
  submitAccessRequest,
} from "@/lib/access-requests";

// Public on purpose (the person has no account yet), so it is defensive:
// strict input checks, a hidden "company" field that only bots fill in, a cap
// on pending requests, and the same "received" answer whether or not the
// address is already a member, so the form never reveals who is one.
export async function requestAccessAction(formData: FormData) {
  if (String(formData.get("company") ?? "").trim() !== "") {
    redirect("/request-access?sent=1"); // a bot: pretend it worked, store nothing
  }

  const name = cleanRequestName(String(formData.get("name") ?? ""));
  const email = normalizeRequestEmail(String(formData.get("email") ?? ""));
  if (!name) redirect("/request-access?error=name");
  if (!email) redirect("/request-access?error=email");

  let outcome: "ok" | "busy" | "failed";
  try {
    outcome = await submitAccessRequest(name, email);
  } catch {
    outcome = "failed";
  }

  if (outcome === "busy") redirect("/request-access?error=busy");
  if (outcome === "failed") redirect("/request-access?error=failed");
  redirect("/request-access?sent=1");
}
