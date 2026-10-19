import { redirect } from "next/navigation";
import { getCurrentParticipant } from "@/lib/participants";

/**
 * Admin-only area. The proxy already sends signed-out visitors to "/";
 * this checks the role. Writes are also protected by RLS in the database.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getCurrentParticipant();
  if (!session) redirect("/");
  if (!session.participant?.is_admin) redirect("/me");

  return children;
}
