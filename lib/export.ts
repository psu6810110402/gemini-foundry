// lib/export.ts
// Export utilities for downloading analysis results

/**
 * Export content as Markdown file
 */
export function exportToMarkdown(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}_${new Date().toISOString().split('T')[0]}.md`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export chat messages as formatted Markdown
 */
export function exportChatAsMarkdown(
  messages: Array<{ role: string; content: string }>,
  title: string = "Gemini Foundry Analysis"
): string {
  const now = new Date().toLocaleString("en-US", {
    dateStyle: "long",
    timeStyle: "short",
  });

  let markdown = `# ${title}\n\n`;
  markdown += `**Generated:** ${now}\n\n`;
  markdown += `---\n\n`;

  messages.forEach((msg, idx) => {
    if (msg.role === "user") {
      markdown += `## 💬 User\n\n${msg.content}\n\n`;
    } else {
      markdown += `## 🤖 Gemini VC\n\n${msg.content}\n\n`;
    }
    if (idx < messages.length - 1) {
      markdown += `---\n\n`;
    }
  });

  markdown += `\n---\n\n*Exported from Gemini Foundry - AI Co-Founder*`;

  return markdown;
}

/**
 * Download content as file
 */
export function downloadAsFile(
  content: string,
  filename: string,
  mimeType: string = "text/markdown"
) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export single analysis as Markdown
 */
export function exportAnalysisAsMarkdown(
  analysis: string,
  type: "market" | "mvp" | "investor"
): string {
  const now = new Date().toLocaleString("en-US", {
    dateStyle: "long",
    timeStyle: "short",
  });

  const titles = {
    market: "📊 Market Analysis Report",
    mvp: "🔧 MVP Blueprint",
    investor: "💰 Investor Analysis",
  };

  let markdown = `# ${titles[type]}\n\n`;
  markdown += `**Generated:** ${now}\n\n`;
  markdown += `---\n\n`;
  markdown += analysis;
  markdown += `\n\n---\n\n*Exported from Gemini Foundry - AI Co-Founder*`;

  return markdown;
}
