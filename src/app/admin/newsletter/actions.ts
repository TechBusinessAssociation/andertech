"use server";

import { del, put } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  addIssue,
  addItem,
  addTags,
  getIssueImageUrls,
  getItemImageUrl,
  moveItem,
  removeIssue,
  removeItem,
  removeTag,
  setIssuePublished,
  setItemTags,
  updateIssue,
  updateItem,
} from "@/lib/newsletter-db";
import {
  IMAGE_TYPES,
  MAX_IMAGE_BYTES,
  MAX_TAGS_PER_ITEM,
  parseTagNames,
  validateIssue,
  validateItem,
} from "@/lib/newsletter";
import { requireNewsletterAdmin } from "@/lib/require-admin";
import { toInt } from "../helpers";

// Every action here calls requireNewsletterAdmin() (full admins and newsletter
// editors), never requireAdmin(), which would lock the editors out.
const SECTION = "/admin/newsletter";
const issuePath = (id: number) => `${SECTION}/issues/${id}`;

function refresh() {
  revalidatePath(SECTION, "layout");
  revalidatePath("/newsletter");
}

// Deleting an old image is housekeeping: if it fails the change is still
// saved, at worst an unused file stays in the Blob store.
async function deleteImages(urls: (string | null)[]) {
  for (const url of urls) {
    if (!url) continue;
    try {
      await del(url);
    } catch {}
  }
}

// ---------- Issues ----------

export async function saveIssueAction(formData: FormData) {
  await requireNewsletterAdmin();

  const field = (name: string) => String(formData.get(name) ?? "").trim();
  const input = {
    title: field("title"),
    publishedOn: field("published_on"),
    intro: field("intro"),
    closing: field("closing"),
  };
  if (!validateIssue(input)) redirect(`${SECTION}?notice=invalid-issue`);

  const rawId = formData.get("id");
  let id: number;
  if (rawId) {
    id = toInt(rawId);
    await updateIssue(id, input);
  } else {
    id = await addIssue(input);
  }

  refresh();
  // A new issue goes straight to its items page; an edit returns to the list.
  redirect(rawId ? SECTION : issuePath(id));
}

export async function setPublishedAction(formData: FormData) {
  await requireNewsletterAdmin();

  await setIssuePublished(
    toInt(formData.get("id")),
    formData.get("published") === "true",
  );

  refresh();
  redirect(String(formData.get("back") ?? "").startsWith(SECTION)
    ? String(formData.get("back"))
    : SECTION);
}

export async function removeIssueAction(formData: FormData) {
  await requireNewsletterAdmin();

  const id = toInt(formData.get("id"));
  const urls = await getIssueImageUrls(id);
  await removeIssue(id);
  await deleteImages(urls);

  refresh();
  redirect(SECTION);
}

// ---------- Items ----------

export async function saveItemAction(formData: FormData) {
  await requireNewsletterAdmin();

  const issueId = toInt(formData.get("issue_id"));
  const back = issuePath(issueId);
  const field = (name: string) => String(formData.get(name) ?? "").trim();
  const rawId = formData.get("id");
  const id = rawId ? toInt(rawId) : null;

  const file = formData.get("image");
  const hasFile = file instanceof File && file.size > 0;
  if (hasFile && (!IMAGE_TYPES.includes(file.type) || file.size > MAX_IMAGE_BYTES)) {
    redirect(`${back}?notice=image`);
  }

  const input = {
    title: field("title"),
    body: field("body"),
    editorsTake: field("editors_take"),
    imageAlt: field("image_alt"),
    authorName: field("author_name"),
  };
  const newNames = parseTagNames(field("new_tags"));
  const tagIds = formData
    .getAll("tag_ids")
    .map((value) => toInt(value))
    .filter((value) => value > 0);
  if (
    !validateItem(input) ||
    !newNames ||
    new Set([...tagIds, ...newNames]).size > MAX_TAGS_PER_ITEM
  ) {
    redirect(`${back}?notice=invalid-item${id ? `&edit=${id}` : ""}`);
  }

  // Keep the current image unless a new one was chosen or "remove" was ticked.
  const oldUrl = id ? await getItemImageUrl(id) : null;
  const removing = formData.get("remove_image") === "on";
  // Checked before uploading so a rejected save never leaves an orphan file.
  if ((hasFile || (oldUrl !== null && !removing)) && !input.imageAlt) {
    redirect(`${back}?notice=alt${id ? `&edit=${id}` : ""}`);
  }

  let imageUrl = removing ? null : oldUrl;
  if (hasFile) {
    // The random suffix means two uploads never overwrite each other and the
    // address can't be guessed from the title.
    const blob = await put(`newsletter/${Date.now()}`, file, {
      access: "public",
      addRandomSuffix: true,
      contentType: file.type,
    });
    imageUrl = blob.url;
  }

  const fields = { ...input, imageUrl };
  let itemId: number;
  if (id) {
    if (!(await updateItem(issueId, id, fields))) {
      // Not this issue's item: nothing was changed, so drop the new upload.
      if (hasFile) await deleteImages([imageUrl]);
      redirect(back);
    }
    itemId = id;
  } else {
    itemId = await addItem(issueId, fields);
  }
  await setItemTags(itemId, tagIds, newNames);

  if (oldUrl && oldUrl !== imageUrl) await deleteImages([oldUrl]);

  refresh();
  redirect(back);
}

export async function removeItemAction(formData: FormData) {
  await requireNewsletterAdmin();

  const issueId = toInt(formData.get("issue_id"));
  const id = toInt(formData.get("id"));
  const imageUrl = await getItemImageUrl(id);
  await removeItem(issueId, id);
  await deleteImages([imageUrl]);

  refresh();
  redirect(issuePath(issueId));
}

export async function moveItemAction(formData: FormData) {
  await requireNewsletterAdmin();

  const issueId = toInt(formData.get("issue_id"));
  await moveItem(
    issueId,
    toInt(formData.get("id")),
    formData.get("direction") === "up" ? "up" : "down",
  );

  refresh();
  redirect(issuePath(issueId));
}

// ---------- Tags ----------

export async function addTagsAction(formData: FormData) {
  await requireNewsletterAdmin();

  const names = parseTagNames(String(formData.get("names") ?? ""));
  if (!names || names.length === 0) redirect(`${SECTION}/tags?notice=invalid`);

  await addTags(names);

  refresh();
  redirect(`${SECTION}/tags`);
}

export async function removeTagAction(formData: FormData) {
  await requireNewsletterAdmin();

  await removeTag(toInt(formData.get("id")));

  refresh();
  redirect(`${SECTION}/tags`);
}
