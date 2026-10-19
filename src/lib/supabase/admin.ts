import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import { getSupabaseEnv } from "./env";

/**
 * Privileged Supabase client (secret key, bypasses RLS).
 * Only for Server Actions that must create/delete auth users or claim a
 * participant. Never pass it to the browser and never use it to read
 * assignments on behalf of a user.
 */
export function createAdminClient() {
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("Missing environment variable SUPABASE_SECRET_KEY.");
  }
  assertSecretKey(secretKey);

  return createClient<Database>(getSupabaseEnv().url, secretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}

/**
 * Fails loudly when SUPABASE_SECRET_KEY holds a public key. With a public key
 * every request silently runs as `anon` and dies on "permission denied".
 * Accepts new secret keys (sb_secret_…) and legacy service_role JWTs.
 */
function assertSecretKey(key: string) {
  if (key.startsWith("sb_secret_")) return;
  if (key.startsWith("sb_publishable_")) {
    throw new Error(
      "SUPABASE_SECRET_KEY contains a publishable key (sb_publishable_…). Use the secret key (sb_secret_…).",
    );
  }
  const payload = key.split(".")[1];
  if (payload) {
    try {
      const { role } = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { role?: string };
      if (role === "service_role") return;
      throw new Error(
        `SUPABASE_SECRET_KEY is a legacy "${role ?? "unknown"}" key. Use the secret key (sb_secret_…).`,
      );
    } catch (error) {
      if (error instanceof Error && error.message.startsWith("SUPABASE_SECRET_KEY")) throw error;
    }
  }
  throw new Error("SUPABASE_SECRET_KEY is not a Supabase secret key (expected sb_secret_…).");
}
