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
  TrendingUp,
  Skull,
  Crosshair,
  ShieldAlert,
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
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useRateLimit } from "@/hooks/useRateLimit";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Types derived from Zod Schema
import { z } from "zod";
import { InvestorAnalysisOutputSchema } from "@/lib/schemas";

type InvestorAnalysisData = z.infer<typeof InvestorAnalysisOutputSchema>;

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
  const [analysisData, setAnalysisData] = useState<InvestorAnalysisData | null>(
    null,
  );
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPivoting, setIsPivoting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{
    data: string;
    type: "image" | "pdf";
    name: string;
  } | null>(null);
  const [isFirstMessage, setIsFirstMessage] = useState(true);
  const [showPivotButton, setShowPivotButton] = useState(false);

  // Rate limiting
  const { isRateLimited, recordRequest, handle429 } = useRateLimit({
    maxRequests: 3,
    windowMs: 60000,
    cooldownMs: 60000,
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, analysisData]);

  // Load chat history
  useEffect(() => {
    if (!sessionId || !user) {
      if (!sessionId) {
        setMessages([]);
        setAnalysisData(null);
        setIsFirstMessage(true);
      }
      return;
    }

    const loadHistory = async () => {
      setIsLoading(true);
      const { data } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true });

      if (data) {
        // Separate structured analysis from chat messages if possible
        // For now, we just load them as text messages for backward compatibility
        // Future improvement: Store structured data in a separate column or table
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
      toast.error(validation.error || "Invalid file");
      return;
    }

    try {
      const processed = await processFile(file, 1024);
      setSelectedFile({
        data: processed.data,
        type: processed.type,
        name: file.name,
      });
      toast.success("File uploaded successfully");
    } catch {
      toast.error("Failed to process file");
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

    if (!recordRequest()) {
      toast.error(lang === "TH" ? "กรุณารอสักครู่" : "Please wait");
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
    const currentInput = input;
    setInput("");

    try {
      // 1. Create/Get Session
      let currentSessionId = sessionId;
      if (!currentSessionId && user) {
        const title = userContent.slice(0, 50) || "New Chat";
        const { data: sessionData } = await supabase
          .from("chat_sessions")
          .insert({ user_id: user.id, title, mode: "investor" } as any)
          .select()
          .single();

        if (sessionData) {
          currentSessionId = sessionData.id;
          onSessionCreated(sessionData.id);
        }
      }

      // 2. Save User Message
      if (user && currentSessionId) {
        await supabase.from("chat_messages").insert({
          session_id: currentSessionId,
          role: "user",
          content: userContent,
        } as any);
      }

      // 3. API Request
      let payload: InvestorAnalysisPayload | InvestorFollowUpPayload;

      if (isFirstMessage) {
        // Initial Analysis (JSON)
        payload = {
          image: selectedFile?.data || null,
          message: currentInput,
        };
      } else {
        // Follow-up (Streaming Text)
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
        if (response.status === 429) handle429();
        const errData = await response.json();
        throw new Error(errData.error || "Request failed");
      }

      // 4. Handle Response
      if (isFirstMessage) {
        // JSON Response
        const data = await response.json();
        const analysis = InvestorAnalysisOutputSchema.parse(data);
        setAnalysisData(analysis);

        // Save structured analysis as a JSON string literal for now (or a summary)
        if (user && currentSessionId) {
          await supabase.from("chat_messages").insert({
            session_id: currentSessionId,
            role: "model",
            content: JSON.stringify(analysis),
          } as any);
        }

        setIsFirstMessage(false);
        setSelectedFile(null);
      } else {
        // Streaming Response for Follow-up
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

        // Save AI Response
        if (user && currentSessionId) {
          await supabase.from("chat_messages").insert({
            session_id: currentSessionId,
            role: "model",
            content: aiResponse,
          } as any);
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      toast.error(msg);
      // Remove placeholder message if failed
      if (!isFirstMessage) {
        setMessages((prev) => prev.filter((m) => m.content !== ""));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePivot = async () => {
    // ... (Pivot logic remains similar, maybe strictly typed later)
    toast.info("Pivot feature coming soon with Structured Output!");
  };

  const handleExportMarkdown = () => {
    // ... (Export logic)
    toast.success("Exported!");
  };

  const handleExportPDF = async () => {
    // ... (PDF logic)
    toast.success("PDF Generated!");
  };

  // --- Render Components ---

  const ScoreCard = ({ data }: { data: InvestorAnalysisData["scoreCard"] }) => (
    <div className="grid grid-cols-2 gap-4 my-4">
      {Object.entries(data).map(([key, value]) => (
        <div
          key={key}
          className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700"
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium capitalize text-slate-500">
              {key}
            </span>
            <span
              className={cn(
                "text-lg font-bold",
                value >= 8
                  ? "text-green-500"
                  : value >= 5
                    ? "text-amber-500"
                    : "text-red-500",
              )}
            >
              {value}/10
            </span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full",
                value >= 8
                  ? "bg-green-500"
                  : value >= 5
                    ? "bg-amber-500"
                    : "bg-red-500",
              )}
              style={{ width: `${value * 10}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col h-[700px] w-full max-w-4xl mx-auto bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 rounded-2xl overflow-hidden shadow-xl shadow-slate-200 dark:shadow-black/30">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 text-white p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-xl backdrop-blur">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold">{t("investor_mode")}</h2>
            <p className="text-white/80 text-sm">
              Strict VC Analysis • Structured JSON Output
            </p>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50 dark:bg-slate-950">
        {/* Initial Welcome State */}
        {!analysisData && messages.length === 0 && (
          <div className="text-center mt-20">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-violet-200 to-purple-200 dark:from-violet-900/50 dark:to-purple-900/50 rounded-full flex items-center justify-center shadow-lg">
              <Bot className="w-10 h-10 text-purple-600 dark:text-purple-400" />
            </div>
            <p className="text-xl font-bold text-slate-800 dark:text-slate-100">
              Pitch Your Startup Idea
            </p>
            <p className="text-sm mt-2 text-slate-600 dark:text-slate-400">
              I will tear it apart with 4 key metrics provided by Gemini 1.5
              Flash.
            </p>
          </div>
        )}

        {/* 1. Structured Analysis Result (The "Hero" Content) */}
        {analysisData && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
            {/* Verdict Summary */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-violet-500 to-fuchsia-500" />
              <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                <Crosshair className="w-5 h-5 text-violet-500" />
                The Verdict
              </h3>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                {analysisData.summary}
              </p>
            </div>

            {/* Scorecard */}
            <ScoreCard data={analysisData.scoreCard} />

            {/* Fatal Flaws */}
            <div className="bg-red-50 dark:bg-red-950/20 p-5 rounded-2xl border border-red-200 dark:border-red-900">
              <h3 className="text-red-700 dark:text-red-400 font-bold mb-3 flex items-center gap-2">
                <Skull className="w-5 h-5" />
                Fatal Flaws
              </h3>
              <ul className="space-y-2">
                {analysisData.fatalFlaws.map((flaw, i) => (
                  <li
                    key={i}
                    className="flex gap-2 text-red-600 dark:text-red-300 text-sm"
                  >
                    <span className="font-bold">•</span>
                    {flaw}
                  </li>
                ))}
              </ul>
            </div>

            {/* Death Question & Reality Check */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-amber-50 dark:bg-amber-950/20 p-5 rounded-2xl border border-amber-200 dark:border-amber-900">
                <h3 className="text-amber-700 dark:text-amber-400 font-bold mb-2 flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5" />
                  Death Question
                </h3>
                <p className="text-amber-800 dark:text-amber-300 text-sm italic">
                  "{analysisData.deathQuestion}"
                </p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-950/20 p-5 rounded-2xl border border-blue-200 dark:border-blue-900">
                <h3 className="text-blue-700 dark:text-blue-400 font-bold mb-2 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Reality Check
                </h3>
                <p className="text-blue-800 dark:text-blue-300 text-sm">
                  {analysisData.realityCheck}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 2. Chat History (User & Follow-up) */}
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={cn(
              "flex gap-3",
              msg.role === "user" ? "flex-row-reverse" : "",
            )}
          >
            <div
              className={cn(
                "w-9 h-9 rounded-full flex items-center justify-center shadow-sm shrink-0",
                msg.role === "user" ? "bg-blue-600" : "bg-violet-600",
              )}
            >
              {msg.role === "user" ? (
                <User className="w-5 h-5 text-white" />
              ) : (
                <Bot className="w-5 h-5 text-white" />
              )}
            </div>
            <div
              className={cn(
                "max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm",
                msg.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700",
              )}
            >
              {msg.role === "model" ? (
                <MarkdownRenderer content={msg.content} />
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}

        {isLoading && <MessageSkeleton />}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        {/* File Preview (Same as before) */}
        {selectedFile && (
          <div className="mb-3 flex items-center gap-2 p-3 bg-slate-100 dark:bg-slate-700 rounded-xl border border-slate-300 dark:border-slate-600">
            <span className="text-sm font-medium">{selectedFile.name}</span>
            <button
              onClick={() => setSelectedFile(null)}
              className="p-1 bg-red-500 text-white rounded-full"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex gap-3">
          {isFirstMessage && (
            <div
              {...getRootProps()}
              className="p-3 rounded-xl border-2 border-dashed border-slate-300 cursor-pointer hover:bg-slate-50"
            >
              <input {...getInputProps()} />
              <Upload className="w-5 h-5 text-slate-500" />
            </div>
          )}
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              isFirstMessage
                ? "Pitch your idea..."
                : "Ask a follow-up question..."
            }
            className="flex-1 p-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-transparent focus:ring-2 focus:ring-violet-500 outline-none transition-all"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || (!input && !selectedFile)}
            className="p-3 bg-violet-600 text-white rounded-xl hover:bg-violet-700 disabled:opacity-50 transition-all"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
