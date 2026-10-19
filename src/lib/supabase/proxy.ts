import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/lib/database.types";
import { readSupabaseEnv } from "./env";

/** Pages only for signed-out visitors: the name picker and the password screens. */
const SIGNED_OUT_ONLY = [/^\/$/, /^\/p\/[^/]+\/?$/];
/** Pages that need a session. Admin role is checked again in the admin layout. */
const SIGNED_IN_ONLY = [/^\/me(\/|$)/, /^\/admin(\/|$)/];

/**
 * Refreshes the Supabase session cookie on every request and routes
 * signed-in and signed-out visitors to the right side of the app.
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
  const { data } = await supabase.auth.getClaims();
  const signedIn = Boolean(data?.claims?.sub);

  const path = request.nextUrl.pathname;
  if (signedIn && SIGNED_OUT_ONLY.some((re) => re.test(path))) {
    return redirectKeepingCookies(request, response, "/me");
  }
  if (!signedIn && SIGNED_IN_ONLY.some((re) => re.test(path))) {
    return redirectKeepingCookies(request, response, "/");
  }

  return response;
}

/** A redirect must carry any refreshed session cookies, or the user gets logged out. */
function redirectKeepingCookies(request: NextRequest, from: NextResponse, pathname: string) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = "";
  const redirect = NextResponse.redirect(url);
  for (const cookie of from.cookies.getAll()) {
    redirect.cookies.set(cookie);
  }
  return redirect;
}
