"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/lib/supabase";
import { Profile, ChatSession } from "@/types/supabase";
import {
  User,
  Mail,
  Calendar,
  MessageSquare,
  Settings,
  ChevronLeft,
  Loader2,
  Edit3,
  Save,
  X,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const { lang, toggleLang } = useLanguage();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState({ sessions: 0, messages: 0 });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editName, setEditName] = useState("");

  useEffect(() => {
    if (!user) return;

    async function loadData() {
      try {
        // Load profile
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user!.id)
          .single();

        if (profileData) {
          setProfile(profileData);
          setEditName(profileData.full_name || "");
        }

        // Load stats
        const { count: sessionCount } = await supabase
          .from("chat_sessions")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user!.id);

        setStats({
          sessions: sessionCount || 0,
          messages: 0, // Would need separate query
        });
      } catch (error) {
        console.warn("Profile or stats tables not found:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: editName })
        .eq("id", user.id);

      if (!error) {
        setProfile((prev) => (prev ? { ...prev, full_name: editName } : prev));
        setEditing(false);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <User className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
            {lang === "TH" ? "กรุณาเข้าสู่ระบบ" : "Please Sign In"}
          </h2>
          <Link href="/" className="text-blue-600 hover:underline">
            {lang === "TH" ? "กลับหน้าหลัก" : "Go to Home"}
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            {lang === "TH" ? "กลับ" : "Back"}
          </Link>
          <h1 className="text-lg font-bold text-slate-900 dark:text-white">
            {lang === "TH" ? "โปรไฟล์" : "Profile"}
          </h1>
          <div className="w-20" />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        {/* Profile Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50">
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
            {/* Avatar */}
            <div className="relative">
              {profile?.avatar_url || user.user_metadata?.avatar_url ? (
                <Image
                  src={profile?.avatar_url || user.user_metadata?.avatar_url}
                  alt="Avatar"
                  width={128}
                  height={128}
                  className="rounded-2xl border-4 border-slate-100 dark:border-slate-800 shadow-lg"
                />
              ) : (
                <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                  <User className="w-16 h-16 text-white" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 space-y-6 text-center md:text-left">
              {/* Name */}
              <div>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {lang === "TH" ? "ชื่อเต็ม" : "Full Name"}
                </label>
                {editing ? (
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      {saving ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Save className="w-5 h-5" />
                      )}
                    </button>
                    <button
                      onClick={() => setEditing(false)}
                      className="p-2 bg-slate-200 dark:bg-slate-700 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                      {profile?.full_name ||
                        user.user_metadata?.full_name ||
                        "Founder"}
                    </p>
                    <button
                      onClick={() => setEditing(true)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  Email
                </label>
                <p className="text-lg text-slate-700 dark:text-slate-300 mt-1">
                  {profile?.email || user.email}
                </p>
              </div>

              {/* Member Since */}
              <div>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {lang === "TH" ? "สมาชิกตั้งแต่" : "Member Since"}
                </label>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  {new Date(
                    profile?.created_at || user.created_at || "",
                  ).toLocaleDateString(lang === "TH" ? "th-TH" : "en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-violet-100 dark:bg-violet-900/30 rounded-xl">
                <MessageSquare className="w-6 h-6 text-violet-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {stats.sessions}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {lang === "TH" ? "เซสชันทั้งหมด" : "Total Sessions"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
            <Settings className="w-5 h-5 text-slate-500" />
            <h3 className="font-bold text-slate-900 dark:text-white">
              {lang === "TH" ? "การตั้งค่า" : "Settings"}
            </h3>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {/* Language */}
            <div className="px-6 py-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900 dark:text-white">
                  {lang === "TH" ? "ภาษา" : "Language"}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {lang === "TH"
                    ? "เลือกภาษาที่ต้องการ"
                    : "Select your preferred language"}
                </p>
              </div>
              <button
                onClick={toggleLang}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                {lang === "TH" ? "🇹🇭 ไทย" : "🇺🇸 English"}
              </button>
            </div>

            {/* Sign Out */}
            <div className="px-6 py-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900 dark:text-white">
                  {lang === "TH" ? "ออกจากระบบ" : "Sign Out"}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {lang === "TH"
                    ? "ออกจากบัญชีของคุณ"
                    : "Sign out of your account"}
                </p>
              </div>
              <button
                onClick={() => signOut()}
                className="px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-lg font-medium hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
              >
                {lang === "TH" ? "ออกจากระบบ" : "Sign Out"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
