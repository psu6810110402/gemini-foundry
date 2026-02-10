import { createClient } from '@supabase/supabase-js';

// WARNING: This file must ONLY be used in Server Components or API Routes.
// NEVER import this into Client Components.

import { env } from "@/lib/env";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!supabaseUrl || !supabaseServiceKey) {
  // During build time or if env vars are missing, we don't want to crash immediately
  // unless we actually try to use the client.
  console.warn("⚠️  Missing Supabase Admin keys");
}

// Lazy initialization or safe fallback
export const supabaseAdmin = (supabaseUrl && supabaseServiceKey) 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : {} as ReturnType<typeof createClient>; // Mock or unsafe cast, but prevents build crash if unused
