// app/api/investor-analysis/route.ts
import { isApiConfigured, generateStructuredContent } from "@/lib/gemini-server";
import { PERSONAS } from "@/lib/gemini";
import { InvestorAnalysisSchema, InvestorAnalysisOutputSchema } from "@/lib/schemas";
import { NextResponse } from "next/server";
import { trackApiUsage } from "@/lib/api-tracking";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    // 0. Check API Key
    if (!isApiConfigured()) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured" },
        { status: 500 }
      );
    }

    const body = await req.json();
    
    // 1. Validate Input with Zod
    const validation = InvestorAnalysisSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message }, 
        { status: 400 }
      );
    }

    const { image, message } = validation.data;

    // 2. Prepare Prompt
    const basePrompt = PERSONAS.INVESTOR;
    const userMessage = message ? `\n\nUser Message: ${message}` : "";
    const prompt = basePrompt + userMessage;

    // 3. Generate Structured Content
    let result;

    if (image) {
       const mimeMatch = image.match(/^data:([^;]+);base64,/);
       const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";
       const base64Data = image.split(",")[1] || image;
      
       const imagePart = {
          inlineData: {
            data: base64Data,
            mimeType: mimeType,
          },
        };
        // @ts-ignore - Part type mismatch between client/server files if any, but runtime is fine
        result = await generateStructuredContent(
          [prompt, imagePart],
          InvestorAnalysisOutputSchema
        );
    } else {
      result = await generateStructuredContent(prompt, InvestorAnalysisOutputSchema);
    }

    // 4. Return JSON Response with Caching
    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });

  } catch (error) {
    console.error("Error in investor analysis:", error);
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    if (errorMessage.includes("SAFETY")) {
      return NextResponse.json(
        { error: "Response blocked by AI Safety Filter. Try rephrasing your input." },
        { status: 400 }
      );
    }

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
      { error: `API Error: ${errorMessage.substring(0, 100)}` },
      { status: 500 }
    );
  }
}
