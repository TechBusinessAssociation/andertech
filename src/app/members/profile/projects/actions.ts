"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { isApprovedMember } from "@/lib/members-db";
import {
  validateProject,
  type ProjectError,
  type ProjectInput,
} from "@/lib/showcase";
import { addProject, removeProject, updateProject } from "@/lib/showcase-db";

// Members editing their own projects -- not an admin action, so each one
// checks the signed-in session itself, and the SQL in showcase-db.ts only ever
// touches rows owned by that email.
async function requireMemberEmail(): Promise<string> {
  const session = await auth();
  const email = session?.user?.email;
  if (!email || !(await isApprovedMember(email))) {
    redirect("/sign-in");
  }
  return email;
}

function readInput(formData: FormData): ProjectInput {
  return {
    title: String(formData.get("title") ?? "").trim(),
    url: String(formData.get("url") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
  };
}

const BASE = "/members/profile/projects";

function fail(error: ProjectError | "cap" | "missing", id?: number): never {
  redirect(`${BASE}?error=${error}${id ? `&edit=${id}` : ""}`);
}

function done(): never {
  revalidatePath("/members");
  redirect(`${BASE}?notice=saved`);
}

export async function addProjectAction(formData: FormData) {
  const email = await requireMemberEmail();
  const input = readInput(formData);
  const error = validateProject(input);
  if (error) fail(error);
  if (!(await addProject(email, input))) fail("cap");
  done();
}

export async function updateProjectAction(formData: FormData) {
  const email = await requireMemberEmail();
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id)) fail("missing");
  const input = readInput(formData);
  const error = validateProject(input);
  if (error) fail(error, id);
  if (!(await updateProject(email, id, input))) fail("missing");
  done();
}

export async function deleteProjectAction(formData: FormData) {
  const email = await requireMemberEmail();
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id)) fail("missing");
  await removeProject(email, id);
  done();
}
