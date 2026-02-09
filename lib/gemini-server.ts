// lib/gemini-server.ts
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, type Part, type GenerateContentStreamResult } from "@google/generative-ai";
import { env } from "@/lib/env";
import { PERSONAS } from "@/lib/gemini"; // Import personas from shared file

// 🔐 API Key Validation (Server-Side Only)
// validation happens in lib/env.ts on import

// 🚀 Singleton Instance
const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

// 🛡️ Safety Settings
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

// 🏭 Export the model (STABLE - gemini-flash-latest)
export const model = genAI.getGenerativeModel({
  model: "gemini-flash-latest",
  safetySettings,
  generationConfig: {
    temperature: 0.7, // Lower temperature for more deterministic JSON
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: "application/json",
  },
});

// 🔐 Check if API is configured
export function isApiConfigured(): boolean {
  return !!env.GEMINI_API_KEY;
}

// 🔄 Helper to retry generation on transient errors (like 503 or 429)
interface GeminiError {
  message?: string;
  status?: number;
}

export async function generateContentStreamWithRetry(
  prompt: string | Array<string | Part>, 
  retries = 3, 
  delayMs = 2000
): Promise<GenerateContentStreamResult> {
  for (let i = 0; i < retries; i++) {
    try {
      return await model.generateContentStream(prompt);
    } catch (error: unknown) {
      const err = error as GeminiError;
      const isRetryable = 
        (err.message?.includes("429") || err.message?.includes("503")) ||
        (err.status === 429 || err.status === 503);
      
      if (isRetryable && i < retries - 1) {
        console.warn(`Retry attempt ${i + 1} for Gemini API...`);
        await new Promise(resolve => setTimeout(resolve, delayMs * Math.pow(2, i))); // Exponential backoff
        continue;
      }
      throw error;
    }
  }
  throw new Error("Failed to generate content");
}

// 🧠 Helper to generate and validate JSON content
export async function generateStructuredContent<T>(
  prompt: string | Array<string | Part>, 
  schema: any, // Zod schema
  retries = 3
): Promise<T> {
  // Append JSON instruction if not present
  const jsonPrompt = Array.isArray(prompt) 
    ? [...prompt, { text: "\n\nIMPORTANT: Return valid JSON only." } as Part]
    : `${prompt}\n\nIMPORTANT: Return valid JSON only.`;

  for (let i = 0; i < retries; i++) {
    try {
      const result = await model.generateContent(jsonPrompt);
      const text = result.response.text();
      
      // Native JSON mode usually returns raw JSON, but sometimes wraps it.
      // We'll try to parse directly first.
      const cleanJson = text.replace(/```json\n?|\n?```/g, "").trim(); 
      const parsed = JSON.parse(cleanJson);
      return schema.parse(parsed);
    } catch (error) {
      console.error(`Attempt ${i+1} JSON Error:`, error);
      if (error instanceof SyntaxError) {
         console.error("Raw Invalid JSON:", (await model.generateContent(jsonPrompt)).response.text());
      }
      if (i === retries - 1) {
        throw new Error(`AI generation failed: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    }
  }
  throw new Error("Failed to generate structured content");
}
