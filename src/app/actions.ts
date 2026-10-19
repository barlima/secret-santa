"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/** Ends the session on this device and returns to the name picker. */
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut({ scope: "local" });
  redirect("/");
}
