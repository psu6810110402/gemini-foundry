import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Admin check
    const adminEmail = process.env.ADMIN_EMAIL || "";
    const isAdmin = user?.email === adminEmail || user?.user_metadata?.role === "admin";

    if (!user || !isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const sessionId = formData.get("sessionId") as string;

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID required" }, { status: 400 });
    }

    // Delete messages first (foreign key constraint)
    await supabaseAdmin.from("chat_messages").delete().eq("session_id", sessionId);
    
    // Delete the session
    const { error } = await supabaseAdmin.from("chat_sessions").delete().eq("id", sessionId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Redirect back to admin
    return NextResponse.redirect(new URL("/admin", request.url));
  } catch (error) {
    console.error("Delete session error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
