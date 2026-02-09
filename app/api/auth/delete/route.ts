import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function DELETE(request: Request) {
  const supabase = await createClient()
  
  // 1. Verify Authentication
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // 2. Try to use service role to delete user from Auth
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    // Always clean up app data first (best effort)
    await supabase.from('chat_sessions').delete().eq('user_id', user.id)
    await supabase.from('api_usage').delete().eq('user_id', user.id)

    if (serviceRoleKey) {
      const adminAuthClient = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceRoleKey,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      )
      
      const { error: deleteError } = await adminAuthClient.auth.admin.deleteUser(user.id)
      if (deleteError) {
        throw deleteError
      }
    } else {
       console.warn("Deleted data, but user account remains (Missing SUPABASE_SERVICE_ROLE_KEY)")
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete account error:', error)
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 })
  }
}
