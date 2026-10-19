"use server";

import { revalidatePath } from "next/cache";
import { isUuid } from "@/lib/auth/participant-email";
import { getCurrentParticipant } from "@/lib/participants";
import { createClient } from "@/lib/supabase/server";
import type { AdminActionState, AdminError } from "./state";

// Every action runs as the signed-in user; RLS and the admin-only RPCs are
// the real guard. The is_admin check here only gives a clean early exit.

const NAME_MAX = 80;

type PgError = { code?: string; message?: string } | null;

function text(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

async function requireAdmin() {
  const session = await getCurrentParticipant();
  return session?.participant?.is_admin ? session.participant : null;
}

function result(
  prev: AdminActionState,
  error: AdminError | null,
  askRedraw = false,
  fullName?: string,
): AdminActionState {
  return { error, askRedraw, seq: prev.seq + 1, fullName };
}

/** After a group change: is the finished draw now out of date? */
async function drawIsStale(): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase.from("draw").select("status, stale").eq("id", 1).single();
  return data?.status === "done" && data.stale;
}

function done() {
  revalidatePath("/admin", "layout");
  revalidatePath("/me");
}

function cleanName(raw: string): { name: string } | { error: AdminError } {
  const name = raw.trim().replace(/\s+/g, " ");
  if (!name) return { error: "emptyName" };
  if (name.length > NAME_MAX) return { error: "nameTooLong" };
  return { name };
}

function nameError(error: PgError): AdminError {
  if (error?.code === "23505") return "duplicateName";
  if (error?.code === "23514") return "nameTooLong";
  console.error("admin: participant write failed", error);
  return "generic";
}

export async function addParticipant(prev: AdminActionState, formData: FormData): Promise<AdminActionState> {
  if (!(await requireAdmin())) return result(prev, "forbidden");
  const typed = text(formData, "fullName");
  const cleaned = cleanName(typed);
  if ("error" in cleaned) return result(prev, cleaned.error, false, typed);

  const supabase = await createClient();
  const { error } = await supabase.from("participants").insert({ full_name: cleaned.name });
  if (error) return result(prev, nameError(error), false, typed);

  done();
  return result(prev, null, await drawIsStale());
}

export async function renameParticipant(prev: AdminActionState, formData: FormData): Promise<AdminActionState> {
  if (!(await requireAdmin())) return result(prev, "forbidden");
  const id = text(formData, "participantId");
  if (!isUuid(id)) return result(prev, "generic");
  const typed = text(formData, "fullName");
  const cleaned = cleanName(typed);
  if ("error" in cleaned) return result(prev, cleaned.error, false, typed);

  const supabase = await createClient();
  const { error } = await supabase.from("participants").update({ full_name: cleaned.name }).eq("id", id);
  if (error) return result(prev, nameError(error), false, typed);

  done();
  return result(prev, null);
}

/** Removes a participant; a database trigger deletes their login too. */
export async function removeParticipant(prev: AdminActionState, formData: FormData): Promise<AdminActionState> {
  if (!(await requireAdmin())) return result(prev, "forbidden");
  const id = text(formData, "participantId");
  if (!isUuid(id)) return result(prev, "generic");

  const supabase = await createClient();
  const { data, error } = await supabase.from("participants").delete().eq("id", id).select("id");
  if (error || !data?.length) {
    // No row deleted: RLS refuses to remove the admin, or it was already gone.
    if (error) console.error("admin: remove failed", error);
    return result(prev, "generic");
  }

  done();
  return result(prev, null, await drawIsStale());
}

/** Deletes the participant's login; they set a new password next time. Their result is kept. */
export async function resetPassword(prev: AdminActionState, formData: FormData): Promise<AdminActionState> {
  if (!(await requireAdmin())) return result(prev, "forbidden");
  const id = text(formData, "participantId");
  if (!isUuid(id)) return result(prev, "generic");

  const supabase = await createClient();
  const { error } = await supabase.rpc("reset_participant_password", { participant_id: id });
  if (error) {
    console.error("admin: reset password failed", error);
    return result(prev, "generic");
  }

  done();
  return result(prev, null);
}

export async function pairSpouses(prev: AdminActionState, formData: FormData): Promise<AdminActionState> {
  if (!(await requireAdmin())) return result(prev, "forbidden");
  const a = text(formData, "personA");
  const b = text(formData, "personB");
  if (!isUuid(a) || !isUuid(b)) return result(prev, "generic");
  if (a === b) return result(prev, "samePerson");

  const supabase = await createClient();
  const { error } = await supabase.from("spouse_pairs").insert({ participant_a: a, participant_b: b });
  if (error) {
    // The one-spouse trigger raises 'already_paired'; the pair index raises 23505.
    if (error.code === "23505" || error.message?.includes("already_paired")) return result(prev, "alreadyPaired");
    if (error.code === "23514") return result(prev, "samePerson");
    console.error("admin: pairing failed", error);
    return result(prev, "generic");
  }

  done();
  return result(prev, null, await drawIsStale());
}

export async function unpairSpouses(prev: AdminActionState, formData: FormData): Promise<AdminActionState> {
  if (!(await requireAdmin())) return result(prev, "forbidden");
  const pairId = text(formData, "pairId");
  if (!isUuid(pairId)) return result(prev, "generic");

  const supabase = await createClient();
  const { error } = await supabase.from("spouse_pairs").delete().eq("id", pairId);
  if (error) {
    console.error("admin: unpairing failed", error);
    return result(prev, "generic");
  }

  done();
  return result(prev, null, await drawIsStale());
}

/** Clears every result and draws again as soon as everyone has a password. */
export async function resetDraw(prev: AdminActionState): Promise<AdminActionState> {
  if (!(await requireAdmin())) return result(prev, "forbidden");

  const supabase = await createClient();
  const { error } = await supabase.rpc("reset_draw");
  if (error) {
    console.error("admin: reset draw failed", error);
    return result(prev, "generic");
  }

  done();
  return result(prev, null);
}
