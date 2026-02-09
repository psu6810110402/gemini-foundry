import { createClient } from "@/lib/supabase/server";

export async function trackApiUsage(endpoint: string, tokens: number) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      await supabase.from("api_usage").insert({
        user_id: user.id,
        endpoint,
        tokens_used: tokens,
      });
    }
  } catch (error) {
    console.error("Failed to track API usage:", error);
  }
}
