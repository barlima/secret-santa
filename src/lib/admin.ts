import "server-only";
import { cache } from "react";
import type { Database } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/server";

export type AdminParticipant = {
  id: string;
  full_name: string;
  is_admin: boolean;
  has_password: boolean;
};

export type SpousePair = { id: string; a: AdminParticipant; b: AdminParticipant };

export type DrawInfo = Pick<
  Database["public"]["Tables"]["draw"]["Row"],
  "status" | "run_at" | "error" | "stale"
>;

export type AdminData = {
  participants: AdminParticipant[];
  pairs: SpousePair[];
  unpaired: AdminParticipant[];
  draw: DrawInfo;
};

/**
 * Everything the admin tabs show, read as the signed-in admin (RLS applies).
 * Results (assignments) are never read here: the admin only sees their own, on /me.
 */
export const getAdminData = cache(async function getAdminData(locale: string): Promise<AdminData> {
  const supabase = await createClient();
  const [participantsRes, pairsRes, drawRes] = await Promise.all([
    supabase.from("participants").select("id, full_name, is_admin, has_password"),
    supabase.from("spouse_pairs").select("id, participant_a, participant_b").order("created_at"),
    supabase.from("draw").select("status, run_at, error, stale").eq("id", 1).single(),
  ]);
  if (participantsRes.error) throw new Error(`Could not load participants: ${participantsRes.error.message}`);
  if (pairsRes.error) throw new Error(`Could not load spouse pairs: ${pairsRes.error.message}`);
  if (drawRes.error) throw new Error(`Could not load draw: ${drawRes.error.message}`);

  const collator = new Intl.Collator(locale, { sensitivity: "base" });
  const participants = participantsRes.data
    .map((p) => ({ ...p, has_password: Boolean(p.has_password) }))
    .sort((x, y) => Number(y.is_admin) - Number(x.is_admin) || collator.compare(x.full_name, y.full_name));

  const byId = new Map(participants.map((p) => [p.id, p]));
  const pairs: SpousePair[] = [];
  const paired = new Set<string>();
  for (const row of pairsRes.data) {
    const a = byId.get(row.participant_a);
    const b = byId.get(row.participant_b);
    if (!a || !b) continue;
    pairs.push({ id: row.id, a, b });
    paired.add(a.id);
    paired.add(b.id);
  }

  return {
    participants,
    pairs,
    unpaired: participants.filter((p) => !paired.has(p.id)),
    draw: drawRes.data,
  };
});
