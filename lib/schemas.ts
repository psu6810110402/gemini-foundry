// lib/schemas.ts
import { z } from "zod";

// --- Shared Schemas ---
export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  full_name: z.string().optional(),
  avatar_url: z.string().url().optional(),
});

export const SessionSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  title: z.string(),
  mode: z.enum(['investor', 'market', 'mvp']),
  created_at: z.string(),
});

// --- AI Structured Output Schemas ---

// 1. Investor Analysis
export const InvestorAnalysisOutputSchema = z.object({
  fatalFlaws: z.array(z.string()).describe("List exactly 3 fatal flaws that make the business uninvestable"),
  deathQuestion: z.string().describe("Checkmate question that kills the deal if not answered"),
  realityCheck: z.string().describe("Brutal assessment of market size realism"),
  scoreCard: z.object({
    team: z.number().min(1).max(10),
    market: z.number().min(1).max(10),
    traction: z.number().min(1).max(10),
    moat: z.number().min(1).max(10),
  }).describe("Numerical rating 1-10"),
  summary: z.string().describe("Overall verdict"),
});

// 2. Market Synthesis
export const MarketSynthesisOutputSchema = z.object({
  marketSnapshot: z.object({
    tam: z.string().describe("Total Addressable Market with currency"),
    sam: z.string().describe("Serviceable Addressable Market"),
    som: z.string().describe("Serviceable Obtainable Market"),
  }),
  competitors: z.array(z.object({
    name: z.string(),
    strength: z.string(),
    weakness: z.string(),
    threatLevel: z.enum(['High', 'Medium', 'Low']),
  })),
  trends: z.array(z.string()).describe("Key market trends"),
  dataQualityScore: z.enum(['A', 'B', 'C', 'D']).describe("Reliability of input data"),
});

// 3. MVP Blueprint
export const MVPBlueprintOutputSchema = z.object({
  techStack: z.object({
    frontend: z.string(),
    backend: z.string(),
    database: z.string(),
    hosting: z.string(),
  }),
  coreFeatures: z.array(z.string()).max(5).describe("List of absolutely essential features"),
  dontBuild: z.array(z.string()).describe("Features to strictly avoid in MVP"),
  roadmap: z.object({
    phase1: z.string().describe("MVP (Weeks 1-4)"),
    phase2: z.string().describe("Beta (Weeks 5-8)"),
    phase3: z.string().describe("Scale (Month 3+)"),
  }),
  estimatedCost: z.string(),
});

// 4. Pivot Strategy
export const PivotStrategyOutputSchema = z.object({
  strategies: z.array(z.object({
    name: z.string(),
    description: z.string(),
    feasibility: z.enum(['High', 'Medium', 'Low']),
    risk: z.enum(['High', 'Medium', 'Low']),
  })),
  mermaidDiagram: z.string().describe("Mermaid flowchart code describing the pivot process or comparison"),
  rationale: z.string(),
});

// 5. Financial Outlook (CFO Mode)
export const FinancialOutlookOutputSchema = z.object({
  revenueProjection: z.array(z.object({
    year: z.string(),
    revenue: z.number(),
    cost: z.number(),
    profit: z.number(),
  })).describe("5-year projection"),
  costBreakdown: z.array(z.object({
    category: z.string(),
    amount: z.number(),
    color: z.string().optional(),
  })).describe("Monthly operational costs distribution"),
  burnRate: z.string().describe("Monthly burn rate"),
  runway: z.string().describe("Estimated runway in months"),
  keyMetrics: z.object({
    cac: z.string().describe("Customer Acquisition Cost"),
    ltv: z.string().describe("Lifetime Value"),
    margin: z.string().describe("Gross Margin %"),
    breakEven: z.string().describe("Estimated break-even point"),
  }),
  cfoVerdict: z.string().describe("Strategic financial advice, like a CFO speaking"),
});

// --- API Input Validation Schemas ---

export const InvestorAnalysisSchema = z.object({
  message: z.string().optional(),
  image: z.string().optional(), // Base64
}).refine(data => data.message || data.image, {
  message: "Either message or image is required"
});

export const InvestorFollowUpSchema = z.object({
  history: z.array(
    z.object({
      role: z.enum(["user", "model"]),
      parts: z.array(z.object({ text: z.string() })),
    }),
  ),
  question: z.string().min(1, "Question cannot be empty"),
});

export const MarketSynthesisSchema = z.object({
  marketData: z.string().min(10, "Market data must be at least 10 characters"),
});

export const MVPBlueprintSchema = z.object({
  idea: z.string().min(10, "Idea description must be at least 10 characters"),
});

export const PivotStrategySchema = z.object({
  currentProduct: z.string().min(5),
  problem: z.string().min(5),
  marketFeedback: z.string().min(5),
});

export const FinancialOutlookSchema = z.object({
  businessModel: z.string().min(10).describe("How the business makes money"),
  costStructure: z.string().min(10).describe("Main costs (server, people, marketing)"),
  currentStage: z.enum(['Idea', 'Pre-Seed', 'Seed', 'Series A']).describe("Current funding stage"),
});

export const AdminActionSchema = z.object({
  userId: z.string().uuid(),
  action: z.enum(['ban', 'unban', 'delete']),
});

export const SessionDeleteSchema = z.object({
  sessionId: z.string().uuid(),
});

// Type Exports
export type InvestorAnalysisInput = z.infer<typeof InvestorAnalysisSchema>;
export type InvestorFollowUpInput = z.infer<typeof InvestorFollowUpSchema>;
export type MarketSynthesisInput = z.infer<typeof MarketSynthesisSchema>;
export type MVPBlueprintInput = z.infer<typeof MVPBlueprintSchema>;
