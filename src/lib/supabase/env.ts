// Public Supabase settings, safe to use in both browser and server code.
// NEXT_PUBLIC_* values are inlined at build time, so they must be read via
// direct property access (not process.env[name]).
//
// Read lazily (at request time), never at module load: a missing variable
// must not break `next build`.

export type SupabasePublicEnv = { url: string; publishableKey: string };

/** Returns null when either variable is missing. */
export function readSupabaseEnv(): SupabasePublicEnv | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  return url && publishableKey ? { url, publishableKey } : null;
}

/** Throws a descriptive error when either variable is missing. */
export function getSupabaseEnv(): SupabasePublicEnv {
  const env = readSupabaseEnv();
  if (!env) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY. See .env.example.",
    );
  }
  return env;
}
