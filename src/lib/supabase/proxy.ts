import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/lib/database.types";
import { readSupabaseEnv } from "./env";

/**
 * Refreshes the Supabase session cookie on every request.
 * Route protection (login / admin) is added in stage 3.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const env = readSupabaseEnv();
  if (!env) {
    // Misconfigured deployment: let the page render its own error state
    // instead of failing every request here.
    return response;
  }

  const supabase = createServerClient<Database>(env.url, env.publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  // Do not put code between createServerClient and getClaims():
  // getClaims() validates the JWT and triggers the token refresh.
  await supabase.auth.getClaims();

  return response;
}
