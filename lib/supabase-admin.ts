import { createClient } from '@supabase/supabase-js';

// WARNING: This file must ONLY be used in Server Components or API Routes.
// NEVER import this into Client Components.

import { env } from "@/lib/env";

// Lazy initialization to prevent build-time errors
export const getSupabaseAdmin = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.warn("⚠️  Missing Supabase Admin keys");
    // Return a dummy client or throw, depending on preference. 
    // For build safety, we return null or a mock, but practically this function 
    // should only be called in runtime where keys exist.
    throw new Error("Missing Supabase Admin keys");
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
};
