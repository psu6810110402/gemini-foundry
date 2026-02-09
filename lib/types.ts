// lib/types.ts
// Shared TypeScript types for Gemini Foundry

// Chat message for display
export interface Message {
  role: "user" | "model";
  content: string;
}

// Gemini chat history format
export interface GeminiHistoryMessage {
  role: "user" | "model";
  parts: { text: string }[];
}

// API Payloads
export interface InvestorAnalysisPayload {
  image: string | null;
  message: string;
}

export interface InvestorFollowUpPayload {
  history: GeminiHistoryMessage[];
  question: string;
}

export interface MarketSynthesisPayload {
  marketData: string;
}

export interface MVPBlueprintPayload {
  idea: string;
}

// API Error Response
export interface APIErrorResponse {
  error: string;
}

// Rate Limit Result
export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetIn: number;
}

// Export types
export type AnalysisType = "market" | "mvp" | "investor";
