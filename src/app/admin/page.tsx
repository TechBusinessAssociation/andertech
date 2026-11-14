import { redirect } from "next/navigation";
import { getAdminAccess } from "@/lib/require-admin";

// Full admins land on Members; editors land on the one section they can open
// (newsletter editors on Newsletter, recruiting editors on Resources).
export default async function AdminIndexPage() {
  const { admin, newsletter } = await getAdminAccess();
  redirect(
    admin
      ? "/admin/members"
      : newsletter
        ? "/admin/newsletter"
        : "/admin/resources",
  );
}
