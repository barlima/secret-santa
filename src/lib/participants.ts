import "server-only";
import { isUuid } from "@/lib/auth/participant-email";
import { createClient } from "@/lib/supabase/server";

/** What anyone (signed out included) may see about a participant. */
export type PublicParticipant = {
  id: string;
  full_name: string;
  has_password: boolean;
};

/** Everyone in the draw, sorted by name in the given locale. Throws if the database is unreachable. */
export async function listParticipants(locale: string): Promise<PublicParticipant[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("participants")
    .select("id, full_name, has_password");
  if (error) throw new Error(`Could not load participants: ${error.message}`);

  const collator = new Intl.Collator(locale, { sensitivity: "base" });
  return data
    .map((p) => ({ ...p, has_password: Boolean(p.has_password) }))
    .sort((a, b) => collator.compare(a.full_name, b.full_name));
}

/** One participant by id, or null when the id is malformed or unknown. */
export async function getParticipant(id: string): Promise<PublicParticipant | null> {
  if (!isUuid(id)) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("participants")
    .select("id, full_name, has_password")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`Could not load participant: ${error.message}`);

  return data ? { ...data, has_password: Boolean(data.has_password) } : null;
}

export type CurrentParticipant = {
  id: string;
  full_name: string;
  is_admin: boolean;
};

/**
 * The participant behind the current session.
 * - `null`: nobody is signed in.
 * - `{ participant: null }`: signed in, but the participant was removed by the admin.
 */
export async function getCurrentParticipant(): Promise<{ participant: CurrentParticipant | null } | null> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getClaims();
  const userId = auth?.claims?.sub;
  if (!userId) return null;

  const { data, error } = await supabase
    .from("participants")
    .select("id, full_name, is_admin")
    .eq("auth_user_id", userId)
    .maybeSingle();
  if (error) throw new Error(`Could not load current participant: ${error.message}`);

  return { participant: data };
}

/** "Piotr Wiśniewski" → "PW". */
export function initials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toLocaleUpperCase();
}

/** "Piotr Wiśniewski" → "Piotr". */
export function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] ?? fullName;
}

/**
 * Display names for chips and lists: first names, falling back to the full
 * name for anyone whose first name is shared ("Jan Nowak", "Jan Kowalski").
 */
export function shortNames<T extends { id: string; full_name: string }>(people: T[]): Map<string, string> {
  const counts = new Map<string, number>();
  for (const p of people) {
    const key = firstName(p.full_name).toLocaleLowerCase();
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return new Map(
    people.map((p) => {
      const first = firstName(p.full_name);
      return [p.id, (counts.get(first.toLocaleLowerCase()) ?? 0) > 1 ? p.full_name : first];
    }),
  );
}
