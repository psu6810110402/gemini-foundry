import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { User } from '@supabase/supabase-js';

// Strict typing for the request body
type BanRequest = {
  userId: string;
  action: 'ban' | 'unban';
};

// Strict typing for the response
type BanResponse = {
  success?: boolean;
  data?: { user: User };
  error?: string;
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabaseAdmin = getSupabaseAdmin();
    
    // Type Guard / Validation
    if (!body.userId || !body.action || !['ban', 'unban'].includes(body.action)) {
       return NextResponse.json({ error: "Invalid request body" } as BanResponse, { status: 400 });
    }

    const { userId, action } = body as BanRequest;
    
    // Ban duration: 'unban' -> 0, 'ban' -> 100 years
    const banDuration = action === 'ban' ? '876000h' : '0s'; 

    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { ban_duration: banDuration }
    );

    if (error) throw error;

    return NextResponse.json({ success: true, data } as BanResponse);
  } catch (error: unknown) {
     const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: errorMessage } as BanResponse, { status: 500 });
  }
}
