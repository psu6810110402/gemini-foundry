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
    const userId = formData.get("userId") as string;

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    // Unban user (set ban duration to 0)
    const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      ban_duration: "0s",
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Redirect back to admin
    return NextResponse.redirect(new URL("/admin", request.url));
  } catch (error) {
    console.error("Unban user error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
