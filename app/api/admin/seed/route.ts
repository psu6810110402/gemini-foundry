// app/api/admin/seed/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    return NextResponse.json(
      { error: "Missing ADMIN_EMAIL or ADMIN_PASSWORD in ENV" },
      { status: 500 }
    );
  }

  try {
    // 1. Check if admin already exists
    const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      return NextResponse.json(
        { error: `Failed to list users: ${listError.message}` },
        { status: 500 }
      );
    }

    const existingAdmin = users.users.find((u) => u.email === email);

    if (existingAdmin) {
      // Update existing admin with new password and role
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        existingAdmin.id,
        {
          password: password,
          user_metadata: { role: "admin", full_name: "System Administrator" },
          email_confirm: true,
        }
      );

      if (updateError) {
        return NextResponse.json(
          { error: `Failed to update admin: ${updateError.message}` },
          { status: 400 }
        );
      }

      return NextResponse.json({
        message: "Admin account updated successfully.",
        email: email,
      });
    }

    // 2. Create new admin
    const { data, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: "admin", full_name: "System Administrator" },
    });

    if (createError) {
      return NextResponse.json(
        { error: `Failed to create admin: ${createError.message}` },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: "Admin account created successfully.",
      email: data.user?.email,
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
