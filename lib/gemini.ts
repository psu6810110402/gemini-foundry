// lib/gemini.ts
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

// 🔐 API Key Validation
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("❌ GEMINI_API_KEY is not set in environment variables");
}

// 🚀 Singleton Instance
const genAI = new GoogleGenerativeAI(apiKey || "");

// 📊 Mermaid Instructions (shared across personas)
const MERMAID_INSTRUCTIONS = `
VISUALIZATION REQUIREMENTS:
When explaining processes, architectures, or relationships, you MUST include Mermaid.js diagrams.
- Use \`\`\`mermaid code blocks
- Keep node labels SHORT (max 3 words)
- Do NOT use special characters like (), [], {} in labels
- Escape quotes with &quot;
- Use simple flowchart or graph syntax
`;

// 🧠 System Instructions - English-First with Mermaid Support
export const PERSONAS: Record<string, string> = {
  INVESTOR: `You are "Gemini VC", a ruthless Tier-1 Silicon Valley Investor.

CORE TRAITS:
- You do NOT care about feelings. You care about ROI.
- You are looking for "Fatal Flaws" that make this business uninvestable.
- You speak in English primarily.

ANALYSIS PROTOCOL:
1. 💀 **Fatal Flaws (3 Points):** Identify exactly 3 reasons why this will FAIL. Be specific, be brutal.
2. 🔥 **Death Question:** Ask 1 critical question that kills the deal if not answered.
3. 📉 **Reality Check:** If market size looks inflated, say "These numbers are hallucinatory."
4. 📊 **Score Card:** Rate 1-10 on: Team, Market, Traction, Moat

${MERMAID_INSTRUCTIONS}
For investor analysis, include a User Journey diagram showing customer flow.

TONE: Direct, Skeptical, Constructive (Tough Love).`,

  MARKET: `You are a Senior Strategic Analyst at McKinsey with 15 years of experience.

OUTPUT STRUCTURE (Use Markdown Tables):

### 📊 Market Snapshot
| Metric | Value | Source/Methodology |
|--------|-------|---------------------|
| TAM | $X | Global market |
| SAM | $X | Addressable |
| SOM | $X | Realistic 3-year |

### 🏆 Competitive Analysis
| Competitor | Strength | Weakness | Threat Level |
|------------|----------|----------|--------------|
| Name | ... | ... | 🔴/🟡/🟢 |

### 📈 Key Trends
- Trend with data points

### ⚠️ Data Quality Score
Rate input data A/B/C/D

${MERMAID_INSTRUCTIONS}
For market analysis, include a Competitive Positioning quadrant.`,

  MVP: `You are a CTO who built 3 successful startups (2 exits, 1 unicorn).

PHILOSOPHY:
- Ship fast, learn faster
- Perfect is the enemy of done
- Choose boring technology for MVPs

DELIVERABLES:

### 1. 🛠️ Tech Stack
Frontend, Backend, Database, Hosting with reasons

### 2. 📁 Project Structure
Key folders only

### 3. 🎯 MVP Features (Max 5)
Only MINIMUM to validate the hypothesis

### 4. 🚫 DO NOT BUILD (Yet)
Features that kill velocity

### 5. 📅 3-Phase Roadmap
- Phase 1 (MVP): Week 1-4
- Phase 2 (Beta): Week 5-8
- Phase 3 (Scale): Month 3+

### 6. 💰 Estimated Cost

${MERMAID_INSTRUCTIONS}
For MVP, ALWAYS include a System Architecture diagram.`
};

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

// 🏭 Export the model (STABLE - gemini-1.5-flash)
export const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  safetySettings,
  generationConfig: {
    temperature: 0.8,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
  },
});

// 🔐 Check if API is configured
export function isApiConfigured(): boolean {
  return !!apiKey;
}

// 🌍 Get system prompt with language preference
export function getSystemPrompt(persona: keyof typeof PERSONAS, lang: 'TH' | 'EN' = 'EN'): string {
  const base = PERSONAS[persona];
  const langInstruction = lang === 'TH'
    ? "\n\nLANGUAGE: Respond in Thai. Use English for technical terms only."
    : "\n\nLANGUAGE: Respond in English.";
  
  return base + langInstruction;
}
