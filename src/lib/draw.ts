import "server-only";
import type { Database } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/server";

type DrawRow = Database["public"]["Tables"]["draw"]["Row"];

export type GroupMember = { id: string; full_name: string; has_password: boolean };

/** Everything the signed-in participant's home screen needs, read through RLS. */
export type MyDrawState =
  | { kind: "waiting"; members: GroupMember[] }
  | { kind: "drawing"; members: GroupMember[] }
  | { kind: "failed"; members: GroupMember[] }
  | { kind: "joinedAfterDraw" }
  | { kind: "revealed"; receiverName: string; drawnAt: string | null };

export async function getMyDrawState(participantId: string): Promise<MyDrawState> {
  const supabase = await createClient();

  const [drawResult, membersResult] = await Promise.all([
    supabase.from("draw").select("status, run_at, error, stale").eq("id", 1).single(),
    supabase.from("participants").select("id, full_name, has_password").order("created_at"),
  ]);
  if (drawResult.error) throw new Error(`Could not load draw: ${drawResult.error.message}`);
  if (membersResult.error) throw new Error(`Could not load participants: ${membersResult.error.message}`);

  const draw: Pick<DrawRow, "status" | "run_at" | "error" | "stale"> = drawResult.data;
  const members = membersResult.data.map((m) => ({ ...m, has_password: Boolean(m.has_password) }));

  if (draw.status === "done") {
    // RLS returns only the row where the signed-in user is the giver.
    const { data, error } = await supabase
      .from("assignments")
      .select("giver_id, receiver:participants!assignments_receiver_id_fkey(full_name)")
      .eq("giver_id", participantId)
      .maybeSingle();
    if (error) throw new Error(`Could not load assignment: ${error.message}`);

    const receiverName = data?.receiver?.full_name;
    return receiverName
      ? { kind: "revealed", receiverName, drawnAt: draw.run_at }
      : { kind: "joinedAfterDraw" };
  }

  if (draw.status === "failed") return { kind: "failed", members };

  // Pending with everyone signed up: the draw is running or about to.
  const everyoneJoined = members.length > 0 && members.every((m) => m.has_password);
  return everyoneJoined ? { kind: "drawing", members } : { kind: "waiting", members };
}
