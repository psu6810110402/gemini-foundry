"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import {
  Moon,
  Sun,
  Languages,
  Sparkles,
  TrendingUp,
  Lightbulb,
  PiggyBank,
} from "lucide-react";
import dynamic from "next/dynamic";
import { TermsModal } from "@/components/TermsModal";
import { useLanguage } from "@/contexts/LanguageContext";
import { Sidebar } from "@/components/Sidebar";
import { AuthButton } from "@/components/AuthButton";

const InvestorSimulator = dynamic(
  () => import("@/components/InvestorSimulator"),
  {
    loading: () => <ComponentLoader />,
  },
);
const MarketAnalysis = dynamic(() => import("@/components/MarketAnalysis"), {
  loading: () => <ComponentLoader />,
});
const MVPGenerator = dynamic(() => import("@/components/MVPGenerator"), {
  loading: () => <ComponentLoader />,
});

function ComponentLoader() {
  return (
    <div className="w-full max-w-4xl mx-auto h-[600px] bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 rounded-2xl animate-shimmer flex items-center justify-center shadow-xl">
      <span className="text-slate-600 dark:text-slate-300 font-medium">
        Loading...
      </span>
    </div>
  );
}

type Mode = "investor" | "market" | "mvp";

export default function Home() {
  const [mode, setMode] = useState<Mode>("investor");
  const { t, lang, toggleLang } = useLanguage();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleNewChat = () => {
    setActiveSessionId(null);
    setMode("investor");
  };

  const handleSelectSession = (id: string) => {
    setActiveSessionId(id);
    // Logic to load session mode will be added in InvestigatorSimulator
  };

  const modes = [
    {
      id: "investor" as Mode,
      labelKey: "investor_mode" as const,
      icon: PiggyBank,
      gradient: "from-violet-500 to-fuchsia-500",
      lightBg: "bg-violet-50 border-violet-300 hover:border-violet-400",
      darkBg:
        "dark:bg-violet-900/40 dark:border-violet-700 dark:hover:border-violet-500",
      description: lang === "TH" ? "จำลอง VC สุดโหด" : "Ruthless VC Simulator",
    },
    {
      id: "market" as Mode,
      labelKey: "market_mode" as const,
      icon: TrendingUp,
      gradient: "from-blue-500 to-cyan-500",
      lightBg: "bg-blue-50 border-blue-300 hover:border-blue-400",
      darkBg:
        "dark:bg-blue-900/40 dark:border-blue-700 dark:hover:border-blue-500",
      description:
        lang === "TH"
          ? "วิเคราะห์ตลาดและคู่แข่ง"
          : "Market & Competitor Analysis",
    },
    {
      id: "mvp" as Mode,
      labelKey: "mvp_mode" as const,
      icon: Lightbulb,
      gradient: "from-amber-500 to-orange-500",
      lightBg: "bg-amber-50 border-amber-300 hover:border-amber-400",
      darkBg:
        "dark:bg-amber-900/40 dark:border-amber-700 dark:hover:border-amber-500",
      description:
        lang === "TH"
          ? "สร้างแผน MVP ที่ใช้ได้จริง"
          : "Build Actionable MVP Plans",
    },
  ];

  const isDark = theme === "dark";

  return (
    <>
      <Sidebar
        currentSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      <div
        className={`transition-all duration-300 ${sidebarOpen ? "md:ml-72" : ""}`}
      >
        <main className="min-h-screen py-8 px-4 bg-gradient-to-br from-slate-100 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
          <TermsModal />

          {/* Header */}
          <div className="max-w-6xl mx-auto mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              {/* Logo */}
              <div className="flex items-center gap-3 pl-12 md:pl-0">
                <div className="p-2.5 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-xl shadow-lg shadow-violet-500/30">
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">
                    <span className="gradient-text">Gemini Foundry</span>
                  </h1>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    v3.0 — AI Co-Founder Platform
                  </p>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-3 self-end md:self-auto">
                <AuthButton />
                {/* Language Toggle */}
                <button
                  onClick={toggleLang}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl 
                    bg-white dark:bg-slate-800 
                    border-2 border-slate-300 dark:border-slate-600
                    hover:border-purple-400 dark:hover:border-purple-500 
                    transition-all text-sm font-semibold
                    text-slate-700 dark:text-slate-200
                    shadow-md hover:shadow-lg"
                >
                  <Languages className="w-4 h-4" />
                  {lang}
                </button>

                {/* Theme Toggle */}
                {mounted && (
                  <button
                    onClick={() => setTheme(isDark ? "light" : "dark")}
                    className="p-2.5 rounded-xl 
                      bg-white dark:bg-slate-800 
                      border-2 border-slate-300 dark:border-slate-600
                      hover:border-purple-400 dark:hover:border-purple-500 
                      transition-all shadow-md hover:shadow-lg"
                    aria-label="Toggle theme"
                  >
                    {isDark ? (
                      <Sun className="w-5 h-5 text-amber-400" />
                    ) : (
                      <Moon className="w-5 h-5 text-slate-600" />
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Mode Selector */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {modes.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  className={`mode-card p-5 rounded-2xl border-2 text-left ${
                    mode === m.id
                      ? `border-transparent bg-gradient-to-r ${m.gradient} text-white shadow-xl`
                      : `${m.lightBg} ${m.darkBg}`
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <m.icon
                      className={`w-6 h-6 ${mode === m.id ? "text-white" : "text-slate-700 dark:text-slate-200"}`}
                    />
                    <span
                      className={`font-bold ${mode === m.id ? "text-white" : "text-slate-800 dark:text-slate-100"}`}
                    >
                      {t(m.labelKey)}
                    </span>
                  </div>
                  <p
                    className={`text-sm ${mode === m.id ? "text-white/90" : "text-slate-600 dark:text-slate-300"}`}
                  >
                    {m.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-6xl mx-auto">
            {mode === "investor" && (
              <InvestorSimulator
                sessionId={activeSessionId}
                onSessionCreated={setActiveSessionId}
              />
            )}
            {mode === "market" && <MarketAnalysis />}
            {mode === "mvp" && <MVPGenerator />}
          </div>

          {/* Footer */}
          <footer className="max-w-6xl mx-auto mt-12 text-center">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Powered by Google Gemini 2.0 Flash • Built for{" "}
              <span className="font-bold text-slate-800 dark:text-slate-200">
                Gemini Hackathon 2026
              </span>
            </p>
          </footer>
        </main>
      </div>
    </>
  );
}
