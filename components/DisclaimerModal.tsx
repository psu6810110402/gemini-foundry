"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, Shield, Rocket } from "lucide-react";

interface DisclaimerModalProps {
  onAccept: () => void;
}

export function DisclaimerModal({ onAccept }: DisclaimerModalProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already accepted
    const hasAccepted = localStorage.getItem("disclaimer_accepted");
    if (!hasAccepted) {
      setIsVisible(true);
    } else {
      onAccept();
    }
  }, [onAccept]);

  const handleAccept = () => {
    localStorage.setItem("disclaimer_accepted", "true");
    setIsVisible(false);
    onAccept();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header with Warning Icon */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 backdrop-blur mb-4">
            <AlertTriangle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">
            ⚠️ Warning: Brutal AI VC Ahead
          </h2>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          <p className="text-slate-600 dark:text-slate-400 text-center">
            Gemini Foundry simulates a{" "}
            <strong>high-pressure VC pitch environment</strong> to stress-test
            your business ideas.
          </p>

          {/* Warning Points */}
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800 dark:text-amber-200">
                The &quot;Gemini VC&quot; may deliver{" "}
                <strong>harsh and direct feedback</strong>
              </p>
            </div>
            <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800 dark:text-amber-200">
                It will <strong>challenge your assumptions</strong> with pointed
                criticism
              </p>
            </div>
            <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800 dark:text-amber-200">
                It will identify{" "}
                <strong>weaknesses you may not want to hear</strong>
              </p>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold">
              <Shield className="w-4 h-4" />
              Disclaimer
            </div>
            <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-1 list-disc list-inside">
              <li>All insights are AI-generated projections only</li>
              <li>Not financial or legal advice</li>
              <li>Consult professionals before making investment decisions</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 pt-0">
          <button
            onClick={handleAccept}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
          >
            <Rocket className="w-5 h-5" />I Understand & Accept
          </button>
          <p className="text-xs text-center text-slate-400 mt-3">
            By clicking, you agree to use this tool under the terms above.
          </p>
        </div>
      </div>
    </div>
  );
}
