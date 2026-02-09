"use client";

import { useState } from "react";
import {
  TrendingUp,
  Send,
  Loader2,
  AlertCircle,
  Download,
  FileText,
  Clock,
  Target,
  Globe,
  PieChart,
  Users,
  BarChart3,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { AnalysisSkeleton } from "@/components/ui/Skeleton";
import { exportAnalysisAsMarkdown, downloadAsFile } from "@/lib/export";
import { generatePDF } from "@/lib/pdfGenerator";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRateLimit } from "@/hooks/useRateLimit";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Types derived from Zod Schema
import { z } from "zod";
import { MarketSynthesisOutputSchema } from "@/lib/schemas";

type MarketAnalysisData = z.infer<typeof MarketSynthesisOutputSchema>;

export default function MarketAnalysis() {
  const { t, lang } = useLanguage();
  const [marketData, setMarketData] = useState("");
  const [analysis, setAnalysis] = useState<MarketAnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Rate limiting
  const { isRateLimited, remainingTime, recordRequest, handle429 } =
    useRateLimit({
      maxRequests: 3,
      windowMs: 60000,
      cooldownMs: 60000,
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!marketData.trim() || isLoading || isRateLimited) return;

    if (!recordRequest()) {
      toast.error(
        lang === "TH"
          ? `กรุณารอ ${remainingTime} วินาที`
          : `Please wait ${remainingTime}s`,
      );
      return;
    }

    setIsLoading(true);
    setAnalysis(null);

    try {
      const response = await fetch("/api/market-synthesis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ marketData }),
      });

      if (!response.ok) {
        if (response.status === 429) handle429();
        const errData = await response.json();
        throw new Error(errData.error || "Failed to analyze");
      }

      const data = await response.json();
      const parsedAnalysis = MarketSynthesisOutputSchema.parse(data);
      setAnalysis(parsedAnalysis);
      toast.success("Market analysis complete!");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportMarkdown = () => {
    // Basic export for now - could be improved to serialize structured data
    if (!analysis) return;
    const content = JSON.stringify(analysis, null, 2);
    downloadAsFile(content, "market-analysis.json");
    toast.success("Exported as JSON");
  };

  const handleExportPDF = async () => {
    toast.info("PDF Export coming soon for Structured Data");
  };

  // --- Render Components ---

  const MarketCard = ({ title, value, sub, icon: Icon, color }: any) => (
    <div
      className={`p-4 rounded-xl border ${color} bg-white dark:bg-slate-800 shadow-sm`}
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-5 h-5 opacity-80" />
        <h3 className="text-sm font-semibold opacity-70 uppercase tracking-wider">
          {title}
        </h3>
      </div>
      <p className="text-2xl font-bold mb-1">{value}</p>
      <p className="text-xs opacity-60">{sub}</p>
    </div>
  );

  return (
    <div className="w-full max-w-4xl mx-auto bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 rounded-2xl overflow-hidden shadow-xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-500 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{t("market_mode")}</h2>
              <p className="text-white/80 text-sm">
                TAM/SAM/SOM & Competitive Landscape
              </p>
            </div>
          </div>
          {analysis && (
            <div className="flex gap-2">
              <button
                onClick={handleExportMarkdown}
                className="flex items-center gap-1 px-3 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors text-sm backdrop-blur"
              >
                <FileText className="w-4 h-4" />
                JSON
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <form
        onSubmit={handleSubmit}
        className="p-6 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
      >
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            {lang === "TH"
              ? "ข้อมูลตลาด (ยิ่งเยอะยิ่งแม่น)"
              : "Raw Market Data (The more details, the better)"}
          </label>
          <textarea
            value={marketData}
            onChange={(e) => setMarketData(e.target.value)}
            placeholder={t("market_placeholder")}
            className="w-full h-32 p-4 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-base resize-none focus:ring-2 focus:ring-cyan-500 outline-none transition-all placeholder:text-slate-400"
            disabled={isLoading}
          />
        </div>
        <button
          type="submit"
          disabled={isLoading || !marketData.trim() || isRateLimited}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-cyan-500/20"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {t("analyzing")}
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              {t("analyze")}
            </>
          )}
        </button>
      </form>

      {/* Results Area */}
      <div className="p-6 min-h-[300px] bg-slate-50 dark:bg-slate-900">
        {isLoading && <AnalysisSkeleton />}

        {analysis && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* 1. Market Sizing Grid */}
            <div className="grid md:grid-cols-3 gap-4">
              <MarketCard
                title="TAM"
                value={analysis.marketSnapshot.tam}
                sub="Total Addressable Market"
                icon={Globe}
                color="border-blue-200 text-blue-700 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300"
              />
              <MarketCard
                title="SAM"
                value={analysis.marketSnapshot.sam}
                sub="Serviceable Addressable Market"
                icon={Target}
                color="border-cyan-200 text-cyan-700 bg-cyan-50 dark:bg-cyan-900/20 dark:border-cyan-800 dark:text-cyan-300"
              />
              <MarketCard
                title="SOM"
                value={analysis.marketSnapshot.som}
                sub="Serviceable Obtainable Market"
                icon={PieChart}
                color="border-emerald-200 text-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-300"
              />
            </div>

            {/* 2. Competitors Table */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between">
                <h3 className="font-bold flex items-center gap-2">
                  <Users className="w-5 h-5 text-slate-500" />
                  Competitive Landscape
                </h3>
                <span
                  className={cn(
                    "px-2 py-1 rounded text-xs font-bold",
                    analysis.dataQualityScore === "A"
                      ? "bg-green-100 text-green-700"
                      : analysis.dataQualityScore === "B"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-amber-100 text-amber-700",
                  )}
                >
                  Data Quality: {analysis.dataQualityScore}
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-900/50 border-b dark:border-slate-700">
                    <tr>
                      <th className="px-6 py-3">Competitor</th>
                      <th className="px-6 py-3">Strength</th>
                      <th className="px-6 py-3">Weakness</th>
                      <th className="px-6 py-3 text-center">Threat</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analysis.competitors.map((comp, i) => (
                      <tr
                        key={i}
                        className="border-b dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                      >
                        <td className="px-6 py-4 font-medium">{comp.name}</td>
                        <td className="px-6 py-4 text-green-600 dark:text-green-400">
                          {comp.strength}
                        </td>
                        <td className="px-6 py-4 text-red-600 dark:text-red-400">
                          {comp.weakness}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={cn(
                              "px-2 py-1 rounded-full text-xs font-bold",
                              comp.threatLevel === "High"
                                ? "bg-red-100 text-red-700"
                                : comp.threatLevel === "Medium"
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-green-100 text-green-700",
                            )}
                          >
                            {comp.threatLevel}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 3. Trends */}
            <div className="bg-slate-100 dark:bg-slate-800/50 p-5 rounded-xl border border-slate-200 dark:border-slate-700">
              <h3 className="font-bold mb-3 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-slate-500" />
                Key Market Trends
              </h3>
              <ul className="space-y-2">
                {analysis.trends.map((trend, i) => (
                  <li key={i} className="flex gap-2 items-start text-sm">
                    <TrendingUp className="w-4 h-4 text-cyan-500 flex-shrink-0 mt-0.5" />
                    <span>{trend}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {!analysis && !isLoading && (
          <div className="flex flex-col items-center justify-center h-[250px] text-slate-400 dark:text-slate-500">
            <TrendingUp className="w-12 h-12 mb-3 opacity-20" />
            <p className="text-center opacity-70">
              Ready to crunch the numbers.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
