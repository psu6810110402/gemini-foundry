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
} from "lucide-react";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { AnalysisSkeleton } from "@/components/ui/Skeleton";
import { exportAnalysisAsMarkdown, downloadAsFile } from "@/lib/export";
import { generatePDF } from "@/lib/pdfGenerator";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRateLimit } from "@/hooks/useRateLimit";

export default function MarketAnalysis() {
  const { t, lang } = useLanguage();
  const [marketData, setMarketData] = useState("");
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Rate limiting: 3 requests per minute
  const { isRateLimited, remainingTime, recordRequest, handle429 } =
    useRateLimit({
      maxRequests: 3,
      windowMs: 60000,
      cooldownMs: 60000,
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!marketData.trim() || isLoading || isRateLimited) return;

    // Check rate limit before making request
    if (!recordRequest()) {
      setError(
        lang === "TH"
          ? "กรุณารอสักครู่ก่อนส่งคำขอใหม่"
          : "Please wait before making another request",
      );
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysis("");

    try {
      const response = await fetch("/api/market-synthesis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ marketData }),
      });

      if (!response.ok) {
        // Handle 429 from server
        if (response.status === 429) {
          handle429();
        }
        const errData = (await response.json()) as { error?: string };
        throw new Error(errData.error || "Failed to analyze");
      }

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let result = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        result += chunk;
        setAnalysis(result);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportMarkdown = () => {
    if (!analysis) return;
    const markdown = exportAnalysisAsMarkdown(analysis, "market");
    const timestamp = new Date().toISOString().split("T")[0];
    downloadAsFile(markdown, `market-analysis-${timestamp}.md`);
  };

  const handleExportPDF = async () => {
    if (!analysis) return;
    await generatePDF("market-export-area", "Market_Analysis");
  };

  return (
    <div className="w-full max-w-4xl mx-auto glass-panel rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 via-blue-600 to-cyan-500 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{t("market_mode")}</h2>
              <p className="text-white/80 text-sm">
                {lang === "TH"
                  ? "วิเคราะห์ TAM/SAM/SOM และคู่แข่ง"
                  : "Analyze TAM/SAM/SOM & Competitors"}
              </p>
            </div>
          </div>
          {analysis && (
            <div className="flex gap-2">
              <button
                onClick={handleExportMarkdown}
                className="flex items-center gap-1 px-3 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors text-sm backdrop-blur"
                title="Export Markdown"
              >
                <FileText className="w-4 h-4" />
              </button>
              <button
                onClick={handleExportPDF}
                className="flex items-center gap-1 px-3 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors text-sm backdrop-blur"
              >
                <Download className="w-4 h-4" />
                PDF
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <form
        onSubmit={handleSubmit}
        className="p-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
      >
        <div className="mb-3">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            {lang === "TH" ? "ข้อมูลตลาดดิบ" : "Raw Market Data"}
          </label>
          <textarea
            value={marketData}
            onChange={(e) => setMarketData(e.target.value)}
            placeholder={t("market_placeholder")}
            className="w-full h-40 p-4 rounded-xl text-base resize-none"
            disabled={isLoading}
          />
        </div>
        <button
          type="submit"
          disabled={isLoading || !marketData.trim() || isRateLimited}
          className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
        >
          {isRateLimited ? (
            <>
              <Clock className="w-5 h-5" />
              {lang === "TH"
                ? `รอ ${remainingTime}s`
                : `Wait ${remainingTime}s`}
            </>
          ) : isLoading ? (
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
      <div className="p-4 min-h-[300px] bg-slate-50 dark:bg-slate-900">
        {error && (
          <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-xl border border-red-200 dark:border-red-800 mb-4">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {error}
          </div>
        )}

        {isLoading && !analysis && <AnalysisSkeleton />}

        {analysis && (
          <div
            id="market-export-area"
            className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700"
          >
            <MarkdownRenderer content={analysis} />
          </div>
        )}

        {!analysis && !isLoading && !error && (
          <div className="flex flex-col items-center justify-center h-[250px] text-slate-400 dark:text-slate-500">
            <TrendingUp className="w-12 h-12 mb-3 opacity-50" />
            <p className="text-center">
              {lang === "TH"
                ? "วางข้อมูลตลาดดิบ เช่น สถิติ ข่าว หรือข้อมูลคู่แข่ง"
                : "Paste raw market data, statistics, or competitor info"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
