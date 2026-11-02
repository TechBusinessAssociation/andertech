import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin";
import { getAdminAccess } from "@/lib/require-admin";

// Full admins land on Members; newsletter editors (who can only open the
// newsletter section) land there instead.
export default async function AdminIndexPage() {
  const { email } = await getAdminAccess();
  redirect((await isAdmin(email)) ? "/admin/members" : "/admin/newsletter");
}
