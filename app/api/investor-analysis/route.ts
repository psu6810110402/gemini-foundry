// app/api/investor-analysis/route.ts
import { model, PERSONAS, isApiConfigured } from "@/lib/gemini";
import { InvestorAnalysisSchema } from "@/lib/schemas";
import { NextResponse } from "next/server";
import { trackApiUsage } from "@/lib/api-tracking";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    // 0. Check API Key
    if (!isApiConfigured()) {
      console.error("API Key check failed. GEMINI_API_KEY:", process.env.GEMINI_API_KEY ? "SET" : "NOT SET");
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured. Please restart the server after adding it to .env" },
        { status: 500 }
      );
    }

    const body = await req.json();
    
    // 1. Validate Input with Zod
    const validation = InvestorAnalysisSchema.safeParse(body);
    if (!validation.success) {
      console.error("Validation failed:", validation.error.issues);
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

    let result;

    // 3. Handle with or without file
    if (image) {
      // Detect MIME type from base64
      const mimeMatch = image.match(/^data:([^;]+);base64,/);
      const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";
      const base64Data = image.split(",")[1] || image;

      console.log("Processing file with MIME type:", mimeType);

      // Handle PDF differently
      if (mimeType === "application/pdf") {
        const pdfPrompt = `${basePrompt}\n\n[User uploaded a PDF file - please ask them to describe it or paste the text content]\n${userMessage || "Please analyze this business document."}`;
        result = await model.generateContentStream(pdfPrompt);
      } else {
        // Image file
        const imagePart = {
          inlineData: {
            data: base64Data,
            mimeType: mimeType,
          },
        };
        result = await model.generateContentStream([prompt, imagePart]);
      }
    } else if (message) {
      // Text only
      result = await model.generateContentStream(prompt);
    } else {
      return NextResponse.json(
        { error: "Please provide either an image or a message" },
        { status: 400 }
      );
    }

    // 4. Create Stream Response
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
            trackApiUsage("/api/investor-analysis", totalTokens).catch(console.error);
          }
        }
      },
    });

    return new NextResponse(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" }
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
