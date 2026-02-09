"use client";
import React, { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";
import { useTheme } from "next-themes";

export default function Mermaid({ chart }: { chart: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const renderChart = async () => {
      if (!chart.trim()) return;

      try {
        // Initialize with current theme
        mermaid.initialize({
          startOnLoad: false,
          theme: resolvedTheme === "dark" ? "dark" : "default",
          securityLevel: "loose",
          fontFamily: "var(--font-inter), var(--font-ibm-thai), sans-serif",
        });

        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
        const { svg: renderedSvg } = await mermaid.render(id, chart);
        setSvg(renderedSvg);
        setError(null);
      } catch (err) {
        console.error("Mermaid render error:", err);
        setError("Failed to render diagram");
        setSvg("");
      }
    };

    renderChart();
  }, [chart, resolvedTheme]);

  if (error) {
    return (
      <div className="my-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
        ⚠️ {error}
        <pre className="mt-2 text-xs overflow-auto p-2 bg-red-100 dark:bg-red-900/30 rounded">
          {chart}
        </pre>
      </div>
    );
  }

  if (!svg) {
    return (
      <div className="my-4 p-8 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse flex items-center justify-center">
        <div className="text-slate-400">Loading diagram...</div>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className="mermaid-container my-6 p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-x-auto flex justify-center"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
