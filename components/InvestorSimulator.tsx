"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
  Upload,
  Send,
  User,
  Bot,
  AlertCircle,
  X,
  Loader2,
  Download,
  GitBranch,
  FileText,
  File,
  Clock,
} from "lucide-react";
import { processFile, validateFile } from "@/lib/fileUtils";
import { exportChatAsMarkdown, downloadAsFile } from "@/lib/export";
import { generatePDF } from "@/lib/pdfGenerator";
import { MessageSkeleton } from "@/components/ui/Skeleton";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { useLanguage } from "@/contexts/LanguageContext";
import type {
  Message,
  InvestorAnalysisPayload,
  InvestorFollowUpPayload,
  GeminiHistoryMessage,
} from "@/lib/types";
import { Database } from "@/types/supabase";
import { InvestorAnalysisSchema, InvestorFollowUpSchema } from "@/lib/schemas";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useRateLimit } from "@/hooks/useRateLimit";

interface InvestorSimulatorProps {
  sessionId: string | null;
  onSessionCreated: (id: string) => void;
}

export default function InvestorSimulator({
  sessionId,
  onSessionCreated,
}: InvestorSimulatorProps) {
  const { user } = useAuth();
  const { t, lang } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPivoting, setIsPivoting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<{
    data: string;
    type: "image" | "pdf";
    name: string;
  } | null>(null);
  const [isFirstMessage, setIsFirstMessage] = useState(true);
  const [showPivotButton, setShowPivotButton] = useState(false);

  // Rate limiting: 3 requests per minute
  const { isRateLimited, remainingTime, recordRequest, handle429 } =
    useRateLimit({
      maxRequests: 3,
      windowMs: 60000,
      cooldownMs: 60000,
    });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load chat history
  useEffect(() => {
    if (!sessionId || !user) {
      if (!sessionId) {
        setMessages([]);
        setIsFirstMessage(true);
      }
      return;
    }

    const loadHistory = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true });

      if (data) {
        setMessages(
          data.map((msg: { role: string; content: string }) => ({
            role: msg.role as "user" | "model",
            content: msg.content,
          })),
        );
        setIsFirstMessage(false);
      }
      setIsLoading(false);
    };

    loadHistory();
  }, [sessionId, user]);

  useEffect(() => {
    if (messages.length >= 2 && !isFirstMessage) {
      setShowPivotButton(true);
    }
  }, [messages, isFirstMessage]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const validation = validateFile(file);
    if (!validation.valid) {
      setError(validation.error || "Invalid file");
      return;
    }

    try {
      const processed = await processFile(file, 1024);
      setSelectedFile({
        data: processed.data,
        type: processed.type,
        name: file.name,
      });
      setError(null);
    } catch {
      setError("Failed to process file");
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp", ".gif"],
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input && !selectedFile) || isLoading || isRateLimited) return;

    // Check rate limit before making request
    if (!recordRequest()) {
      setError(
        lang === "TH"
          ? "กรุณารอสักครู่ก่อนส่งคำขอใหม่"
          : "Please wait before making another request",
      );
      return;
    }

    const endpoint = isFirstMessage
      ? "/api/investor-analysis"
      : "/api/investor-followup";

    const userContent =
      input || (selectedFile ? `[Uploaded: ${selectedFile.name}]` : "");
    const userMsg: Message = { role: "user", content: userContent };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);
    setError(null);
    const currentInput = input;
    setInput("");

    try {
      // 1. Create session if needed
      let currentSessionId = sessionId;
      if (!currentSessionId && user) {
        const title = userContent.slice(0, 50) || "New Chat";
        const { data: sessionData, error: sessionError } = await supabase
          .from("chat_sessions")
          .insert({
            user_id: user.id,
            title,
            mode: "investor",
          } satisfies Database["public"]["Tables"]["chat_sessions"]["Insert"])
          .select()
          .single();

        if (sessionData) {
          currentSessionId = sessionData.id;
          onSessionCreated(sessionData.id);
        }
      }

      // 2. Dave user message
      if (user && currentSessionId) {
        await supabase.from("chat_messages").insert({
          session_id: currentSessionId,
          role: "user",
          content: userContent,
        } satisfies Database["public"]["Tables"]["chat_messages"]["Insert"]);
      }

      let payload: InvestorAnalysisPayload | InvestorFollowUpPayload;

      if (isFirstMessage) {
        payload = {
          image: selectedFile?.data || null,
          message: currentInput,
        };
      } else {
        const history: GeminiHistoryMessage[] = messages.map((msg) => ({
          role: msg.role,
          parts: [{ text: msg.content }],
        }));
        payload = { history, question: currentInput };
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        // Handle 429 from server
        if (response.status === 429) {
          handle429();
        }
        const errData = (await response.json()) as { error?: string };
        throw new Error(errData.error || "Request failed");
      }

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let aiResponse = "";

      setMessages((prev) => [...prev, { role: "model", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        aiResponse += chunk;

        setMessages((prev) => {
          const newHistory = [...prev];
          newHistory[newHistory.length - 1].content = aiResponse;
          return newHistory;
        });
      }

      // 3. Save AI response
      if (user && currentSessionId) {
        await supabase.from("chat_messages").insert({
          session_id: currentSessionId,
          role: "model",
          content: aiResponse,
        } satisfies Database["public"]["Tables"]["chat_messages"]["Insert"]);
      }

      if (isFirstMessage) {
        setIsFirstMessage(false);
        setSelectedFile(null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      setMessages((prev) => prev.filter((msg) => msg.content !== ""));
    } finally {
      setIsLoading(false);
    }
  };

  const handlePivot = async () => {
    if (isPivoting || messages.length < 2) return;

    setIsPivoting(true);
    setError(null);

    try {
      const history: GeminiHistoryMessage[] = messages.map((msg) => ({
        role: msg.role,
        parts: [{ text: msg.content }],
      }));

      const response = await fetch("/api/pivot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ history }),
      });

      if (!response.ok) throw new Error("Pivot failed");
      if (!response.body) throw new Error("No response body");

      setMessages((prev) => [
        ...prev,
        { role: "user", content: "🔄 Request: Pivot Strategy" },
      ]);
      setMessages((prev) => [...prev, { role: "model", content: "" }]);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let pivotResponse = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        pivotResponse += chunk;

        setMessages((prev) => {
          const newHistory = [...prev];
          newHistory[newHistory.length - 1].content = pivotResponse;
          return newHistory;
        });
      }

      setShowPivotButton(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Pivot failed";
      setError(errorMessage);
    } finally {
      setIsPivoting(false);
    }
  };

  const handleExportMarkdown = () => {
    if (messages.length === 0) return;
    const markdown = exportChatAsMarkdown(
      messages,
      "Investor Analysis - Gemini Foundry",
    );
    const timestamp = new Date().toISOString().split("T")[0];
    downloadAsFile(markdown, `investor-analysis-${timestamp}.md`);
  };

  const handleExportPDF = async () => {
    if (messages.length === 0) return;
    await generatePDF("investor-chat-export", "Investor_Analysis");
  };

  return (
    <div className="flex flex-col h-[700px] w-full max-w-4xl mx-auto bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 rounded-2xl overflow-hidden shadow-xl shadow-slate-200 dark:shadow-black/30">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{t("investor_mode")}</h2>
              <p className="text-white/80 text-sm">
                {lang === "TH"
                  ? "อัปโหลด BMC, Pitch Deck หรือ PDF"
                  : "Upload BMC, Pitch Deck or PDF"}
              </p>
            </div>
          </div>
          {messages.length > 0 && (
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
                title={t("download")}
              >
                <Download className="w-4 h-4" />
                PDF
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div
        id="investor-chat-export"
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-100 dark:bg-slate-900/50"
      >
        {messages.length === 0 && (
          <div className="text-center mt-20">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-violet-200 to-purple-200 dark:from-violet-900/50 dark:to-purple-900/50 rounded-full flex items-center justify-center shadow-lg">
              <Bot className="w-10 h-10 text-purple-600 dark:text-purple-400" />
            </div>
            <p className="text-xl font-bold text-slate-800 dark:text-slate-100">
              {lang === "TH"
                ? "พร้อม Stress-Test ไอเดียของคุณ?"
                : "Ready to Stress-Test Your Idea?"}
            </p>
            <p className="text-sm mt-2 text-slate-600 dark:text-slate-400">
              {t("upload_hint")}
            </p>
            <div className="flex justify-center gap-2 mt-4">
              <span className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium border border-slate-300 dark:border-slate-600">
                JPEG
              </span>
              <span className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium border border-slate-300 dark:border-slate-600">
                PNG
              </span>
              <span className="px-3 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm font-medium border border-red-300 dark:border-red-800">
                PDF
              </span>
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
          >
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 shadow-md ${
                msg.role === "user"
                  ? "bg-gradient-to-br from-blue-500 to-blue-600"
                  : "bg-gradient-to-br from-violet-500 to-fuchsia-500"
              }`}
            >
              {msg.role === "user" ? (
                <User className="w-5 h-5 text-white" />
              ) : (
                <Bot className="w-5 h-5 text-white" />
              )}
            </div>
            <div
              className={`max-w-[85%] p-4 rounded-2xl shadow-md ${
                msg.role === "user"
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                  : "bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700"
              }`}
            >
              {msg.role === "model" ? (
                <MarkdownRenderer content={msg.content || "..."} />
              ) : (
                <p className="text-sm">{msg.content}</p>
              )}
            </div>
          </div>
        ))}

        {isLoading && messages[messages.length - 1]?.content === "" && (
          <MessageSkeleton />
        )}

        {error && (
          <div className="flex items-center gap-2 p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm rounded-xl border-2 border-red-300 dark:border-red-800">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {error}
          </div>
        )}

        {showPivotButton && !isLoading && !isPivoting && (
          <div className="flex justify-center">
            <button
              onClick={handlePivot}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full font-bold shadow-lg shadow-emerald-500/30 hover:shadow-xl transition-all animate-bounce-subtle"
            >
              <GitBranch className="w-5 h-5" />
              {t("pivot")}
            </button>
          </div>
        )}

        {isPivoting && (
          <div className="flex justify-center">
            <div className="flex items-center gap-2 px-6 py-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full border-2 border-emerald-300 dark:border-emerald-800">
              <Loader2 className="w-5 h-5 animate-spin" />
              {lang === "TH"
                ? "กำลังหาทางรอด..."
                : "Finding pivot strategies..."}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        {selectedFile && (
          <div className="mb-3 flex items-center gap-2 p-3 bg-slate-100 dark:bg-slate-700 rounded-xl border border-slate-300 dark:border-slate-600">
            {selectedFile.type === "image" ? (
              <img
                src={selectedFile.data}
                alt="Preview"
                className="h-16 rounded-lg border-2 border-slate-300 dark:border-slate-600"
              />
            ) : (
              <div className="h-16 w-16 flex items-center justify-center bg-red-100 dark:bg-red-900/50 rounded-lg border-2 border-red-300 dark:border-red-800">
                <File className="w-8 h-8 text-red-500" />
              </div>
            )}
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate flex-1">
              {selectedFile.name}
            </span>
            <button
              onClick={() => setSelectedFile(null)}
              className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-md"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex gap-3">
          {isFirstMessage && (
            <div
              {...getRootProps()}
              className={`p-3 rounded-xl border-2 border-dashed cursor-pointer transition-all flex-shrink-0 ${
                isDragActive
                  ? "border-purple-500 bg-purple-100 dark:bg-purple-900/30"
                  : "border-slate-400 dark:border-slate-600 hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/30"
              }`}
            >
              <input {...getInputProps()} />
              <Upload
                className={`w-5 h-5 ${isDragActive ? "text-purple-600" : "text-slate-500 dark:text-slate-400"}`}
              />
            </div>
          )}

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              isFirstMessage
                ? lang === "TH"
                  ? "เพิ่มบริบท (ไม่บังคับ)..."
                  : "Add context (optional)..."
                : t("followup_placeholder")
            }
            className="flex-1 p-3 rounded-xl text-base"
            disabled={isLoading}
          />

          <button
            type="submit"
            disabled={isLoading || (!input && !selectedFile) || isRateLimited}
            className="p-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl hover:from-violet-700 hover:to-fuchsia-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-violet-500/30 hover:shadow-xl flex-shrink-0"
          >
            {isRateLimited ? (
              <Clock className="w-5 h-5" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
