"use client";

import { useState } from "react";
import {
  GitBranch,
  Send,
  Loader2,
  AlertCircle,
  TrendingUp,
  AlertTriangle,
  Zap,
  Target,
  FileText,
} from "lucide-react";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { AnalysisSkeleton } from "@/components/ui/Skeleton";
import { downloadAsFile } from "@/lib/export";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRateLimit } from "@/hooks/useRateLimit";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Types derived from Zod Schema
import { z } from "zod";
import { PivotStrategyOutputSchema } from "@/lib/schemas";

type PivotStrategyData = z.infer<typeof PivotStrategyOutputSchema>;

export default function PivotStrategy() {
  const { t, lang } = useLanguage();
  const [currentProduct, setCurrentProduct] = useState("");
  const [problem, setProblem] = useState("");
  const [marketFeedback, setMarketFeedback] = useState("");
  const [results, setResults] = useState<PivotStrategyData | null>(null);
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
    if (
      !currentProduct.trim() ||
      !problem.trim() ||
      !marketFeedback.trim() ||
      isLoading ||
      isRateLimited
    )
      return;

    if (!recordRequest()) {
      toast.error(
        lang === "TH"
          ? `กรุณารอ ${remainingTime} วินาที`
          : `Please wait ${remainingTime}s`,
      );
      return;
    }

    setIsLoading(true);
    setResults(null);

    try {
      const response = await fetch("/api/pivot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentProduct, problem, marketFeedback }),
      });

      if (!response.ok) {
        if (response.status === 429) handle429();
        const errData = await response.json();
        throw new Error(errData.error || "Failed to generate pivot strategy");
      }

      const data = await response.json();
      const parsedResults = PivotStrategyOutputSchema.parse(data);
      setResults(parsedResults);
      toast.success("Pivot Strategy Generated!");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportJSON = () => {
    if (!results) return;
    const content = JSON.stringify(results, null, 2);
    downloadAsFile(content, "pivot-strategy.json");
    toast.success("Exported as JSON");
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 rounded-2xl overflow-hidden shadow-xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur">
              <GitBranch className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">
                {t("pivot_mode") || "Pivot Strategy"}
              </h2>
              <p className="text-white/80 text-sm">Find your new direction</p>
            </div>
          </div>
          {results && (
            <div className="flex gap-2">
              <button
                onClick={handleExportJSON}
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
        className="p-6 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 space-y-4"
      >
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Current Product
          </label>
          <input
            type="text"
            value={currentProduct}
            onChange={(e) => setCurrentProduct(e.target.value)}
            placeholder="e.g. A social network for cats"
            className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
            disabled={isLoading}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Problem / Pain Point
            </label>
            <textarea
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              placeholder="e.g. Users love the photos but hate the ads"
              className="w-full h-24 p-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 resize-none focus:ring-2 focus:ring-emerald-500 outline-none"
              disabled={isLoading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Market Feedback
            </label>
            <textarea
              value={marketFeedback}
              onChange={(e) => setMarketFeedback(e.target.value)}
              placeholder="e.g. 'I would pay if I could print the photos'"
              className="w-full h-24 p-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 resize-none focus:ring-2 focus:ring-emerald-500 outline-none"
              disabled={isLoading}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={
            isLoading ||
            !currentProduct.trim() ||
            !problem.trim() ||
            !marketFeedback.trim() ||
            isRateLimited
          }
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-500/20"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {t("analyzing")}
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Generate Pivot Options
            </>
          )}
        </button>
      </form>

      {/* Results Area */}
      <div className="p-6 min-h-[300px] bg-slate-50 dark:bg-slate-900">
        {isLoading && <AnalysisSkeleton />}

        {results && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* 1. Rationale */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-5 rounded-xl border border-blue-100 dark:border-blue-800">
              <h3 className="flex items-center gap-2 font-bold text-blue-800 dark:text-blue-300 mb-2">
                <Target className="w-5 h-5" />
                Strategic Rationale
              </h3>
              <p className="text-blue-900 dark:text-blue-100 text-sm leading-relaxed">
                {results.rationale}
              </p>
            </div>

            {/* 2. Strategies Grid */}
            <div className="grid md:grid-cols-3 gap-4">
              {results.strategies.map((strategy, i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col h-full"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                      {i + 1}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span
                        className={cn(
                          "text-xs px-2 py-0.5 rounded-full font-bold",
                          strategy.feasibility === "High"
                            ? "bg-green-100 text-green-700"
                            : strategy.feasibility === "Medium"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700",
                        )}
                      >
                        Feasibility: {strategy.feasibility}
                      </span>
                      <span
                        className={cn(
                          "text-xs px-2 py-0.5 rounded-full font-bold",
                          strategy.risk === "Low"
                            ? "bg-green-100 text-green-700"
                            : strategy.risk === "Medium"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700",
                        )}
                      >
                        Risk: {strategy.risk}
                      </span>
                    </div>
                  </div>
                  <h3 className="font-bold text-lg mb-2 text-slate-800 dark:text-slate-100">
                    {strategy.name}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 flex-grow">
                    {strategy.description}
                  </p>
                </div>
              ))}
            </div>

            {/* 3. Mermaid Diagram */}
            <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <h3 className="font-bold mb-4 flex items-center gap-2 text-slate-700 dark:text-slate-200">
                <GitBranch className="w-5 h-5" />
                Process Flow
              </h3>
              <div className="overflow-x-auto">
                <MarkdownRenderer
                  content={`\`\`\`mermaid\n${results.mermaidDiagram}\n\`\`\``}
                />
              </div>
            </div>
          </div>
        )}

        {!results && !isLoading && (
          <div className="flex flex-col items-center justify-center h-[250px] text-slate-400 dark:text-slate-500">
            <GitBranch className="w-12 h-12 mb-3 opacity-20" />
            <p className="text-center opacity-70">
              Enter your current product details to see pivot options.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
