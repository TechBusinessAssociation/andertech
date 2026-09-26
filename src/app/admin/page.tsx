import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/require-admin";

export default async function AdminIndexPage() {
  await requireAdmin();
  redirect("/admin/members");
}
