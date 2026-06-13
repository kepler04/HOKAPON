import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database.types";

/**
 * Session refresh + admin route guard, invoked from the root middleware.ts.
 *
 * Responsibilities:
 *  1. Keep the Supabase auth session fresh (writes refreshed cookies).
 *  2. Protect /admin/** — redirect unauthenticated users to /login.
 *  3. Verify the user has an admin/staff role in `profiles`.
 *
 * IMPORTANT (per Supabase SSR docs): do not run any logic between creating the
 * client and calling getUser(), and always return the `supabaseResponse`
 * object so refreshed cookies propagate.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isAdminRoute = pathname.startsWith("/admin");

  if (isAdminRoute) {
    // Not signed in → bounce to login.
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }

    // Signed in → verify role.
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || (profile.role !== "admin" && profile.role !== "staff")) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("error", "no_access");
      return NextResponse.redirect(url);
    }
  }

  // Already authenticated users shouldn't sit on /login.
  if (pathname === "/login" && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
