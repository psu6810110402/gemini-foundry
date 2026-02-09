// lib/schemas.ts
import { z } from "zod";

// Investor Analysis - Initial file analysis (image or PDF)
export const InvestorAnalysisSchema = z.object({
  image: z.string().nullable().optional(),
  message: z.string().optional(),
}).refine((data) => data.image || data.message, {
  message: "Either an image/PDF or a message is required",
});

// Investor Follow-up - Conversation continuation  
export const InvestorFollowUpSchema = z.object({
  history: z.array(
    z.object({
      role: z.enum(["user", "model"]),
      parts: z.array(z.object({ text: z.string() })),
    }),
  ),
  question: z.string().min(1, "Question cannot be empty"),
});

// Market Synthesis - TAM/SAM/SOM Analysis
export const MarketSynthesisSchema = z.object({
  marketData: z
    .string()
    .min(50, "Market data is too short to analyze (min 50 chars)")
    .max(100000, "Market data is too large (max 100k chars)"),
});

// MVP Blueprint - Technical roadmap
export const MVPBlueprintSchema = z.object({
  idea: z
    .string()
    .min(10, "Please describe your idea in more detail (min 10 chars)")
    .max(1000, "Business idea description is too long (max 1000 chars)"),
});

// Type Exports
export type InvestorAnalysisInput = z.infer<typeof InvestorAnalysisSchema>;
export type InvestorFollowUpInput = z.infer<typeof InvestorFollowUpSchema>;
export type MarketSynthesisInput = z.infer<typeof MarketSynthesisSchema>;
export type MVPBlueprintInput = z.infer<typeof MVPBlueprintSchema>;
