// app/api/pivot/route.ts
import { model } from "@/lib/gemini";
import { NextResponse } from "next/server";
import { trackApiUsage } from "@/lib/api-tracking";

// Use Node.js runtime for compatibility
export const runtime = "nodejs";

const PIVOT_PROMPT = `
You are a Startup Pivot Strategist. The user's business idea has received harsh criticism.

YOUR TASK:
Generate exactly 3 creative PIVOT STRATEGIES to save this business.

FORMAT YOUR RESPONSE EXACTLY LIKE THIS:

## 🔄 Pivot Strategy 1: [Name]
**The Fix:** [How this addresses the fatal flaws]
**New Target:** [Who you're now serving]
**Why It Works:** [Brief reasoning]

## 🔄 Pivot Strategy 2: [Name]
**The Fix:** [How this addresses the fatal flaws]
**New Target:** [Who you're now serving]  
**Why It Works:** [Brief reasoning]

## 🔄 Pivot Strategy 3: [Name]
**The Fix:** [How this addresses the fatal flaws]
**New Target:** [Who you're now serving]
**Why It Works:** [Brief reasoning]

Be creative but realistic. The goal is to find a viable path forward.
`;

export async function POST(req: Request) {
  try {
    const { history } = await req.json();

    if (!history || !Array.isArray(history)) {
      return NextResponse.json(
        { error: "Invalid history format" },
        { status: 400 }
      );
    }

    // Start chat with history and add pivot prompt
    const chat = model.startChat({
      history: history,
      generationConfig: {
        maxOutputTokens: 2000,
        temperature: 0.9,
      },
    });

    const result = await chat.sendMessageStream(PIVOT_PROMPT);

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
            trackApiUsage("/api/pivot", totalTokens).catch(console.error);
          }
        }
      },
    });

    return new NextResponse(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (error) {
    console.error("Pivot API error:", error);
    return NextResponse.json(
      { error: "Failed to generate pivot strategies" },
      { status: 500 }
    );
  }
}
