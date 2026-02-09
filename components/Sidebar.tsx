"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import {
  MessageSquare,
  Plus,
  Clock,
  Trash2,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Lightbulb,
  Users,
} from "lucide-react";
import { ChatSession } from "@/types/supabase";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

interface SidebarProps {
  currentSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const modeIcons = {
  investor: Users,
  market: TrendingUp,
  mvp: Lightbulb,
};

const modeColors = {
  investor:
    "bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400",
  market: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  mvp: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
};

export function Sidebar({
  currentSessionId,
  onSelectSession,
  onNewChat,
  isOpen,
  setIsOpen,
}: SidebarProps) {
  const { user } = useAuth();
  const { t, lang } = useLanguage();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setSessions([]);
      setLoading(false);
      return;
    }

    const fetchSessions = async () => {
      try {
        const { data, error } = await supabase
          .from("chat_sessions")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) {
          // Table doesn't exist yet - silently handle
          console.warn("Chat sessions table not found, please run SQL setup");
          setSessions([]);
        } else {
          setSessions(data || []);
        }
      } catch {
        setSessions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();

    // Subscribe to realtime changes
    const channel = supabase
      .channel("schema-db-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "chat_sessions",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setSessions((prev) => [payload.new as ChatSession, ...prev]);
          } else if (payload.eventType === "DELETE") {
            setSessions((prev) => prev.filter((s) => s.id !== payload.old.id));
          } else if (payload.eventType === "UPDATE") {
            setSessions((prev) =>
              prev.map((s) =>
                s.id === payload.new.id ? (payload.new as ChatSession) : s,
              ),
            );
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const confirmMsg =
      lang === "TH"
        ? "คุณแน่ใจหรือไม่ที่จะลบการสนทนานี้?"
        : "Are you sure you want to delete this chat?";
    if (!confirm(confirmMsg)) return;

    await supabase.from("chat_sessions").delete().eq("id", id);
    if (currentSessionId === id) {
      onNewChat();
    }
  };

  // Mobile/Collapsed state
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed left-4 top-24 z-40 p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-md md:hidden"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    );
  }

  return (
    <>
      {/* Overlay for mobile */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden"
        onClick={() => setIsOpen(false)}
      />

      <div className="fixed md:static inset-y-0 left-0 w-72 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-r border-slate-200 dark:border-slate-800 flex flex-col z-40 transition-transform duration-300 transform md:transform-none">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-500" />
            {lang === "TH" ? "ประวัติการสนทนา" : "Chat History"}
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            className="md:hidden p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-4">
          <button
            onClick={() => {
              onNewChat();
              if (window.innerWidth < 768) setIsOpen(false);
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 text-white dark:text-slate-900 rounded-xl font-medium hover:opacity-90 transition-all shadow-lg shadow-slate-900/20 dark:shadow-slate-100/20"
          >
            <Plus className="w-5 h-5" />
            {lang === "TH" ? "สนทนาใหม่" : "New Chat"}
          </button>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-1.5">
          {!user ? (
            <div className="p-4 text-center text-sm text-slate-500 dark:text-slate-400">
              {lang === "TH"
                ? "เข้าสู่ระบบเพื่อบันทึกประวัติการสนทนา"
                : "Sign in to save your chat history"}
            </div>
          ) : loading ? (
            <div className="space-y-2 p-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-14 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : sessions.length === 0 ? (
            <div className="p-8 text-center">
              <MessageSquare className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {lang === "TH" ? "ยังไม่มีประวัติ" : "No history yet"}
              </p>
            </div>
          ) : (
            sessions.map((session) => {
              const ModeIcon = modeIcons[session.mode] || MessageSquare;
              const modeColor = modeColors[session.mode] || modeColors.investor;

              return (
                <div
                  key={session.id}
                  onClick={() => {
                    onSelectSession(session.id);
                    if (window.innerWidth < 768) setIsOpen(false);
                  }}
                  className={cn(
                    "group flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-all",
                    currentSessionId === session.id
                      ? "bg-white dark:bg-slate-800 shadow-md border border-slate-200 dark:border-slate-700"
                      : "hover:bg-slate-100 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400",
                  )}
                >
                  <div className={cn("p-2 rounded-lg shrink-0", modeColor)}>
                    <ModeIcon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        "text-sm font-medium truncate",
                        currentSessionId === session.id
                          ? "text-slate-900 dark:text-slate-100"
                          : "",
                      )}
                    >
                      {session.title ||
                        (lang === "TH" ? "สนทนาใหม่" : "New Chat")}
                    </p>
                    <p className="text-xs text-slate-400 truncate">
                      {new Date(session.created_at).toLocaleDateString(
                        lang === "TH" ? "th-TH" : "en-US",
                        { month: "short", day: "numeric" },
                      )}
                    </p>
                  </div>
                  {user && (
                    <button
                      onClick={(e) => handleDelete(e, session.id)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-500 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}
