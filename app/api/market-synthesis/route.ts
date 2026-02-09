// app/api/market-synthesis/route.ts
import { model, PERSONAS, isApiConfigured } from "@/lib/gemini";
import { MarketSynthesisSchema } from "@/lib/schemas";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

// Use Node.js runtime for compatibility
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
    const { marketData } = MarketSynthesisSchema.parse(body);

    const prompt = `${PERSONAS.MARKET}\n\nRaw Market Data:\n${marketData}`;

    const result = await model.generateContentStream(prompt);

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) {
              controller.enqueue(encoder.encode(text));
            }
          }
        } catch (err) {
          console.error("Stream error:", err);
          controller.error(err);
        } finally {
          controller.close();
        }
      },
    });

    return new NextResponse(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" }
    });
  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof ZodError) {
      const firstError = error.issues[0];
      return NextResponse.json(
        { error: firstError?.message || "Validation error" },
        { status: 400 }
      );
    }

    console.error("Error in market synthesis:", error);
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

    if (errorMessage.includes("429") || errorMessage.includes("quota") || errorMessage.includes("RESOURCE_EXHAUSTED")) {
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
