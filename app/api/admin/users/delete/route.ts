import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const supabaseAdmin = getSupabaseAdmin();
    const { data: { user } } = await supabase.auth.getUser();

    // Admin check
    const adminEmail = process.env.ADMIN_EMAIL || "";
    const isAdmin = user?.email === adminEmail || user?.user_metadata?.role === "admin";

    if (!user || !isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const userId = formData.get("userId") as string;

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    // Delete user's data first
    await supabaseAdmin.from("chat_messages").delete().eq("user_id", userId);
    await supabaseAdmin.from("chat_sessions").delete().eq("user_id", userId);
    await supabaseAdmin.from("profiles").delete().eq("id", userId);

    // Delete the user from auth
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Redirect back to admin
    return NextResponse.redirect(new URL("/admin", request.url));
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
