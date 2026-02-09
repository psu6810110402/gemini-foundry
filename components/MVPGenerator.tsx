"use client";

import { useState } from "react";
import {
  Lightbulb,
  Send,
  Loader2,
  AlertCircle,
  Download,
  FileText,
  Clock,
  Rocket,
  CheckSquare,
  Users,
  Code2,
  ListTodo,
} from "lucide-react";
import { AnalysisSkeleton } from "@/components/ui/Skeleton";
import { downloadAsFile } from "@/lib/export";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRateLimit } from "@/hooks/useRateLimit";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Types derived from Zod Schema
import { z } from "zod";
import { MVPBlueprintOutputSchema } from "@/lib/schemas";

type MVPBlueprintData = z.infer<typeof MVPBlueprintOutputSchema>;

export default function MVPGenerator() {
  const { t, lang } = useLanguage();
  const [idea, setIdea] = useState("");
  const [blueprint, setBlueprint] = useState<MVPBlueprintData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Rate limiting
  const { isRateLimited, remainingTime, recordRequest, handle429 } =
    useRateLimit({
      maxRequests: 3,
      windowMs: 60000,
      cooldownMs: 60000,
    });

  const exampleIdeas =
    lang === "TH"
      ? [
          "แอปจองคิวร้านอาหารล่วงหน้า",
          "แพลตฟอร์มให้เช่าชุดออกงาน",
          "Uber สำหรับพี่เลี้ยงสุนัข",
        ]
      : [
          "Restaurant queue booking app",
          "Formal dress rental platform",
          "Uber for dog walkers",
        ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idea.trim() || isLoading || isRateLimited) return;

    if (!recordRequest()) {
      toast.error(
        lang === "TH"
          ? `กรุณารอ ${remainingTime} วินาที`
          : `Please wait ${remainingTime}s`,
      );
      return;
    }

    setIsLoading(true);
    setBlueprint(null);

    try {
      const response = await fetch("/api/mvp-blueprint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea }),
      });

      if (!response.ok) {
        if (response.status === 429) handle429();
        const errData = await response.json();
        throw new Error(errData.error || "Failed to generate");
      }

      const data = await response.json();
      const parsedBlueprint = MVPBlueprintOutputSchema.parse(data);
      setBlueprint(parsedBlueprint);
      toast.success("MVP Blueprint Generated!");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportMarkdown = () => {
    if (!blueprint) return;
    const content = JSON.stringify(blueprint, null, 2);
    downloadAsFile(content, "mvp-blueprint.json");
    toast.success("Exported as JSON");
  };

  const handleExportPDF = async () => {
    toast.info("PDF Export coming soon for Structured Data");
  };

  // --- Render Components ---

  return (
    <div className="w-full max-w-4xl mx-auto bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 rounded-2xl overflow-hidden shadow-xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur">
              <Lightbulb className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{t("mvp_mode")}</h2>
              <p className="text-white/80 text-sm">
                {lang === "TH"
                  ? "สร้างแผน Tech Stack และ Roadmap"
                  : "Generate Tech Stack & Roadmap"}
              </p>
            </div>
          </div>
          {blueprint && (
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
              ? "อธิบายไอเดีย Startup ของคุณ"
              : "Describe Your Startup Idea"}
          </label>
          <textarea
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder={t("idea_placeholder")}
            className="w-full h-32 p-4 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-base resize-none focus:ring-2 focus:ring-orange-500 outline-none transition-all placeholder:text-slate-400"
            disabled={isLoading}
          />
        </div>

        {/* Example Ideas */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="text-sm text-slate-500 dark:text-slate-400">
            {lang === "TH" ? "ลอง:" : "Try:"}
          </span>
          {exampleIdeas.map((example, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setIdea(example)}
              className="text-sm px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors"
            >
              {example}
            </button>
          ))}
        </div>

        <button
          type="submit"
          disabled={isLoading || !idea.trim() || isRateLimited}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-bold hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-orange-500/20"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {t("analyzing")}
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              {t("generate")}
            </>
          )}
        </button>
      </form>

      {/* Results Area */}
      <div className="p-6 min-h-[300px] bg-slate-50 dark:bg-slate-900">
        {isLoading && <AnalysisSkeleton />}

        {blueprint && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* 1. Feature List */}
            <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                <Rocket className="w-5 h-5" />
                Core Features (MVP)
              </h3>
              <div className="grid md:grid-cols-2 gap-3">
                {blueprint.coreFeatures.map((feature, i) => (
                  <div
                    key={i}
                    className="flex gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-800"
                  >
                    <CheckSquare className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Tech Stack & Cost Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Tech Stack */}
              <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <h3 className="font-bold mb-3 flex items-center gap-2 text-slate-700 dark:text-slate-200">
                  <Code2 className="w-5 h-5" />
                  Recommended Tech Stack
                </h3>
                <ul className="space-y-3">
                  {Object.entries(blueprint.techStack).map(([key, value]) => (
                    <li
                      key={key}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-slate-500 capitalize">{key}</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">
                        {value}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Estimated Cost */}
              <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <h3 className="font-bold mb-3 flex items-center gap-2 text-slate-700 dark:text-slate-200">
                  <Users className="w-5 h-5" />
                  Estimated Cost & Avoid
                </h3>
                <div className="mb-4">
                  <p className="text-sm text-slate-500 mb-1">MVP Total Cost</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {blueprint.estimatedCost}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-2">
                    Dont Build (Distractions)
                  </p>
                  <ul className="space-y-1">
                    {blueprint.dontBuild.map((item, i) => (
                      <li
                        key={i}
                        className="text-xs text-red-500 flex items-center gap-1"
                      >
                        <span className="w-1 h-1 rounded-full bg-red-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* 3. Development Roadmap */}
            <div className="bg-slate-100 dark:bg-slate-800/50 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
              <h3 className="font-bold mb-6 flex items-center gap-2 text-slate-700 dark:text-slate-200">
                <ListTodo className="w-5 h-5" />
                Development Roadmap
              </h3>
              <div className="relative border-l-2 border-slate-300 dark:border-slate-600 ml-3 space-y-8">
                {[
                  {
                    phase: "Phase 1: MVP (Weeks 1-4)",
                    tasks: blueprint.roadmap.phase1,
                  },
                  {
                    phase: "Phase 2: Beta (Weeks 5-8)",
                    tasks: blueprint.roadmap.phase2,
                  },
                  {
                    phase: "Phase 3: Scale (Month 3+)",
                    tasks: blueprint.roadmap.phase3,
                  },
                ].map((step, i) => (
                  <div key={i} className="ml-6 relative">
                    <span className="absolute -left-[31px] top-0 flex h-6 w-6 items-center justify-center rounded-full bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 text-xs font-bold text-slate-500">
                      {i + 1}
                    </span>
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-1">
                      {step.phase}
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      {step.tasks}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {!blueprint && !isLoading && (
          <div className="flex flex-col items-center justify-center h-[250px] text-slate-400 dark:text-slate-500">
            <Lightbulb className="w-12 h-12 mb-3 opacity-20" />
            <p className="text-center opacity-70">
              Build your roadmap in seconds.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
