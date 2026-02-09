// app/api/market-synthesis/route.ts
import { generateStructuredContent } from "@/lib/gemini-server";
import { PERSONAS } from "@/lib/gemini";
import { MarketSynthesisSchema, MarketSynthesisOutputSchema } from "@/lib/schemas";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    // 0. Check API Key
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured" },
        { status: 500 }
      );
    }

    const body = await req.json();
    
    // 1. Validate Input
    const validation = MarketSynthesisSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message }, 
        { status: 400 }
      );
    }

    const { marketData } = validation.data;

    // 2. Prepare Prompt
    const prompt = `${PERSONAS.MARKET}\n\nMarket Data:\n${marketData}`;

    const result = await generateStructuredContent(prompt, MarketSynthesisOutputSchema);

    // 3. Return JSON Response with Caching
    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid response format from AI" },
        { status: 502 }
      );
    }

    console.error("Error in market synthesis:", error);
    
    const errorMessage = error instanceof Error ? error.message : String(error);

    if (errorMessage.includes("API_KEY") || errorMessage.includes("401") || errorMessage.includes("403")) {
      return NextResponse.json(
        { error: "Invalid API Key. Please check your GEMINI_API_KEY." },
        { status: 500 }
      );
    }

    if (errorMessage.includes("429") || errorMessage.includes("quota")) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please wait a minute and try again." },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: `Failed to generate market analysis: ${errorMessage.substring(0, 100)}` },
      { status: 500 }
    );
  }
}
