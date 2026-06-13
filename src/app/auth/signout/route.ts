import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** Sign the admin out and return to the login page. */
export async function POST(request: Request) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/login", request.url), {
    status: 302,
  });
}
