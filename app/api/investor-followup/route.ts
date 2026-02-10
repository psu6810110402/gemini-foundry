// app/api/investor-followup/route.ts
import { model, isApiConfigured } from "@/lib/gemini-server";
import { InvestorFollowUpSchema } from "@/lib/schemas";
import { NextResponse } from "next/server";
import { trackApiUsage } from "@/lib/api-tracking";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    if (!isApiConfigured()) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { history, question } = InvestorFollowUpSchema.parse(body);

    const chat = model.startChat({
      history: history,
      generationConfig: {
        maxOutputTokens: 2000,
      },
    });

    const result = await chat.sendMessageStream(question);

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        let totalTokens = 0;
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) {
              controller.enqueue(encoder.encode(text));
            }
            if (chunk.usageMetadata) {
              totalTokens = chunk.usageMetadata.totalTokenCount;
            }
          }
        } catch (err) {
          console.error("Stream error:", err);
          controller.error(err);
        } finally {
          controller.close();
          if (totalTokens > 0) {
            trackApiUsage("/api/investor-followup", totalTokens).catch(console.error);
          }
        }
      },
    });

    return new NextResponse(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" }
    });
  } catch (error) {
    console.error("Error in investor followup:", error);
    return NextResponse.json(
      { error: "Failed to process follow-up" },
      { status: 500 }
    );
  }
}
