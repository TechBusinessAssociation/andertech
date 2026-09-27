"use server";

import { signOut } from "@/auth";

// A server action a client component (src/components/header-actions.tsx) can
// import directly. That component can't declare an inline "use server"
// action itself -- only a Server Component can -- so this small file is the
// bridge, same pattern as any other server action module in this project.
export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}
