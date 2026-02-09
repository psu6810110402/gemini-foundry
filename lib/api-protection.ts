// lib/api-protection.ts
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { checkRateLimit } from "./security";
import { supabase } from "./supabase";

type ApiOptions = {
  requireAuth?: boolean;
  rateLimit?: { limit: number; window: number };
};

export function withApiProtection(
  handler: (req: Request, userId: string | null) => Promise<NextResponse>,
  options: ApiOptions = { requireAuth: true, rateLimit: { limit: 20, window: 60000 } }
) {
  return async (req: Request) => {
    try {
      // 1. Rate Limiting
      const headerList = await headers();
      const ip = headerList.get("x-forwarded-for") || "unknown";
      
      if (options.rateLimit && !checkRateLimit(ip, options.rateLimit.limit, options.rateLimit.window)) {
        return NextResponse.json({ error: "Too many requests" }, { status: 429 });
      }

      // 2. Authentication
      let userId: string | null = null;
      if (options.requireAuth) {
        const authHeader = req.headers.get("Authorization");
        const token = authHeader?.replace("Bearer ", "");
        
        if (!token) {
          // Fallback to cookie check if needed, or strict header
          const { data: { user }, error } = await supabase.auth.getUser();
          if (error || !user) {
             return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
          }
          userId = user.id;
        } else {
           const { data: { user }, error } = await supabase.auth.getUser(token);
           if (error || !user) {
             return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
           }
           userId = user.id;
        }
      }

      return await handler(req, userId);

    } catch (error) {
      console.error("API Error:", error);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  };
}

/**
 * Standard API error response
 */
export function apiError(message: string, status: number = 400): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

/**
 * Standard API success response
 */
export function apiSuccess<T>(data: T, status: number = 200): NextResponse {
  return NextResponse.json(data, { status });
}
