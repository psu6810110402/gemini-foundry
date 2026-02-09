"use client";

import { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  DollarSign,
  Activity,
  AlertTriangle,
  Loader2,
  Send,
  FileText,
} from "lucide-react";
import { downloadAsFile } from "@/lib/export";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRateLimit } from "@/hooks/useRateLimit";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { z } from "zod";
import { FinancialOutlookOutputSchema } from "@/lib/schemas";
import { AnalysisSkeleton } from "@/components/ui/Skeleton";

type FinanceData = z.infer<typeof FinancialOutlookOutputSchema>;

export default function FinancialAnalysis() {
  const { t, lang } = useLanguage();
  const [businessModel, setBusinessModel] = useState("");
  const [costStructure, setCostStructure] = useState("");
  const [currentStage, setCurrentStage] = useState("Idea");
  const [results, setResults] = useState<FinanceData | null>(null);
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
      !businessModel.trim() ||
      !costStructure.trim() ||
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
      const response = await fetch("/api/finance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessModel, costStructure, currentStage }),
      });

      if (!response.ok) {
        if (response.status === 429) handle429();
        const errData = await response.json();
        throw new Error(
          errData.error || "Failed to generate financial outlook",
        );
      }

      const data = await response.json();
      // Ensure we parse to match schema type
      const parsedResults = FinancialOutlookOutputSchema.parse(data);
      setResults(parsedResults);
      toast.success("CFO Outlook Generated!");
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
    downloadAsFile(content, "financial-outlook.json");
    toast.success("Exported as JSON");
  };

  const stages = ["Idea", "Pre-Seed", "Seed", "Series A"];

  return (
    <div className="w-full max-w-4xl mx-auto bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 rounded-2xl overflow-hidden shadow-xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">CFO Simulator</h2>
              <p className="text-white/80 text-sm">
                Financial Planning & Projections
              </p>
            </div>
          </div>
          {results && (
            <button
              onClick={handleExportJSON}
              className="flex items-center gap-1 px-3 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors text-sm backdrop-blur"
            >
              <FileText className="w-4 h-4" />
              JSON
            </button>
          )}
        </div>
      </div>

      {/* Input Area */}
      <form
        onSubmit={handleSubmit}
        className="p-6 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 space-y-4"
      >
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Business Model (How do you make money?)
            </label>
            <textarea
              value={businessModel}
              onChange={(e) => setBusinessModel(e.target.value)}
              placeholder="e.g. SaaS subscription $29/mo, B2B Enterprise sales..."
              className="w-full h-24 p-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 resize-none focus:ring-2 focus:ring-blue-500 outline-none"
              disabled={isLoading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Cost Structure (Main expenses?)
            </label>
            <textarea
              value={costStructure}
              onChange={(e) => setCostStructure(e.target.value)}
              placeholder="e.g. High server costs for AI, 2 senior developers, marketing ads..."
              className="w-full h-24 p-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 resize-none focus:ring-2 focus:ring-blue-500 outline-none"
              disabled={isLoading}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Current Stage
          </label>
          <div className="flex gap-2 flex-wrap">
            {stages.map((s) => (
              <button
                type="button"
                key={s}
                onClick={() => setCurrentStage(s)}
                className={cn(
                  "px-4 py-2 rounded-lg border text-sm font-medium transition-all",
                  currentStage === s
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 hover:border-blue-400",
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={
            isLoading ||
            !businessModel.trim() ||
            !costStructure.trim() ||
            isRateLimited
          }
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/20"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Crunching Numbers...
            </>
          ) : (
            <>
              <Activity className="w-5 h-5" />
              Generate Financial Outlook
            </>
          )}
        </button>
      </form>

      {/* Results Area */}
      <div className="p-6 min-h-[300px] bg-slate-50 dark:bg-slate-900">
        {isLoading && <AnalysisSkeleton />}

        {results && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* 1. Key Metrics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <p className="text-xs text-slate-500 uppercase font-bold">
                  Burn Rate
                </p>
                <p className="text-xl font-bold text-red-500">
                  {results.burnRate}
                </p>
              </div>
              <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <p className="text-xs text-slate-500 uppercase font-bold">
                  Runway
                </p>
                <p className="text-xl font-bold text-emerald-500">
                  {results.runway}
                </p>
              </div>
              <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <p className="text-xs text-slate-500 uppercase font-bold">
                  Margin
                </p>
                <p className="text-xl font-bold text-blue-500">
                  {results.keyMetrics.margin}
                </p>
              </div>
              <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <p className="text-xs text-slate-500 uppercase font-bold">
                  Break Even
                </p>
                <p className="text-xl font-bold text-purple-500">
                  {results.keyMetrics.breakEven}
                </p>
              </div>
            </div>

            {/* 2. Charts Row */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Revenue Projection Bar Chart */}
              <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm h-[350px]">
                <h3 className="font-bold mb-4 text-slate-700 dark:text-slate-200">
                  5-Year Revenue Projection
                </h3>
                <ResponsiveContainer width="100%" height="90%">
                  <BarChart data={results.revenueProjection}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="year" fontSize={12} stroke="#888888" />
                    <YAxis
                      fontSize={12}
                      stroke="#888888"
                      tickFormatter={(val) => `$${val}`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(255, 255, 255, 0.9)",
                        borderRadius: "8px",
                        border: "none",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                      formatter={(value) => [`$${value}`, ""]}
                    />
                    <Legend />
                    <Bar
                      dataKey="revenue"
                      name="Revenue"
                      fill="#8884d8"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="cost"
                      name="Cost"
                      fill="#ff7c7c"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="profit"
                      name="Profit"
                      fill="#82ca9d"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Cost Breakdown Pie Chart */}
              <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm h-[350px]">
                <h3 className="font-bold mb-4 text-slate-700 dark:text-slate-200">
                  Monthly Cost Breakdown
                </h3>
                <ResponsiveContainer width="100%" height="90%">
                  <PieChart>
                    <Pie
                      data={results.costBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="amount"
                      nameKey="category"
                      label={(props) => {
                        const { payload, percent } = props;
                        return `${payload.category} ${(percent ? percent * 100 : 0).toFixed(0)}%`;
                      }}
                    >
                      {results.costBreakdown.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color || "#8884d8"}
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `$${value}`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 3. CFO Verdict */}
            <div className="bg-slate-100 dark:bg-slate-800/50 p-6 rounded-xl border-l-4 border-blue-500">
              <h3 className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-100 mb-3">
                <DollarSign className="w-5 h-5 text-blue-500" />
                CFO Verification
              </h3>
              <p className="text-slate-700 dark:text-slate-300 italic whitespace-pre-wrap leading-relaxed">
                "{results.cfoVerdict}"
              </p>
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between border-b border-slate-300 dark:border-slate-700 pb-1">
                  <span className="text-slate-500">CAC</span>
                  <span className="font-mono font-bold">
                    {results.keyMetrics.cac}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-300 dark:border-slate-700 pb-1">
                  <span className="text-slate-500">LTV</span>
                  <span className="font-mono font-bold">
                    {results.keyMetrics.ltv}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {!results && !isLoading && (
          <div className="flex flex-col items-center justify-center h-[250px] text-slate-400 dark:text-slate-500">
            <DollarSign className="w-12 h-12 mb-3 opacity-20" />
            <p className="text-center opacity-70">
              Input your business details to get a financial sanity check.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
