import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { supabase } from '@/lib/supabase'; // Used to check current session if needed
import { User } from '@supabase/supabase-js';

// Strict typing for the response
type AdminUserListResponse = {
  users?: User[];
  error?: string;
};

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // 1. Security Check (Optional strict session check here, or rely on Admin Page protection)
    // For now, we'll allow the request but in production middleware should protect this route.
    
    // 2. Fetch users from Auth (contains ban status)
    const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();

    if (error) {
      return NextResponse.json({ error: error.message } as AdminUserListResponse, { status: 500 });
    }

    return NextResponse.json({ users } as AdminUserListResponse);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: errorMessage } as AdminUserListResponse, { status: 500 });
  }
}
