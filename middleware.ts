import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Root middleware. Refreshes the Supabase session on every request and guards
 * the /admin area (see src/lib/supabase/middleware.ts).
 */
export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static, _next/image (build assets)
     * - favicon.ico, public image/font files
     * Always run on /admin and /login (handled by the patterns above).
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)",
  ],
};
