"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { isApprovedMember, updateMemberProfile } from "@/lib/members-db";
import { isProgram } from "@/lib/programs";

// A member editing their own profile -- not an admin action, so this checks
// the signed-in session itself rather than requireAdmin().
export async function updateProfileAction(formData: FormData) {
  const session = await auth();
  const email = session?.user?.email;
  if (!email || !(await isApprovedMember(email))) {
    redirect("/sign-in");
  }

  const displayName = String(formData.get("displayName") ?? "").trim();
  const gradYearRaw = String(formData.get("gradYear") ?? "").trim();
  const programRaw = String(formData.get("program") ?? "").trim();

  // A blank grad year is fine (null); a non-numeric one is dropped rather
  // than saved as garbage. Loosely bounded -- MBA programs run 1-2 years and
  // this only labels a cohort, so it's not worth a strict range check.
  const gradYear =
    gradYearRaw && /^\d{4}$/.test(gradYearRaw) ? Number(gradYearRaw) : null;
  const program = programRaw && isProgram(programRaw) ? programRaw : null;

  await updateMemberProfile(email, {
    displayName: displayName ? displayName.slice(0, 100) : null,
    gradYear,
    program,
  });

  redirect("/members/profile?notice=saved");
}
