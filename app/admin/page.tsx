import { redirect } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { createClient } from "@/lib/supabase/server";
import {
  Users,
  MessageSquare,
  Database,
  Activity,
  ShieldAlert,
  TrendingUp,
  Clock,
  Zap,
  BarChart3,
  XCircle,
  RefreshCw,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Trash2,
} from "lucide-react";
import type { User } from "@supabase/supabase-js";
import type { ChatMessage, Profile } from "@/types/supabase";
import Link from "next/link";
import { AdminActions } from "@/components/admin/AdminActions";

export const dynamic = "force-dynamic";

// Stat Card Component
function StatCard({
  label,
  value,
  icon: Icon,
  color,
  bg,
  trend,
  trendValue,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
  trend?: "up" | "down";
  trendValue?: string;
}) {
  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-all hover:shadow-md hover:scale-[1.02]">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${bg}`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
        {trend && (
          <div
            className={`flex items-center gap-1 text-xs font-medium ${
              trend === "up" ? "text-green-600" : "text-red-600"
            }`}
          >
            {trend === "up" ? (
              <ArrowUpRight size={14} />
            ) : (
              <ArrowDownRight size={14} />
            )}
            {trendValue}
          </div>
        )}
      </div>
      <h3 className="text-3xl font-bold dark:text-white">{value}</h3>
      <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1">
        {label}
      </p>
    </div>
  );
}

// User Row Component
function UserRow({ user, index }: { user: User; index: number }) {
  const isBanned = user.banned_until
    ? new Date(user.banned_until) > new Date()
    : false;
  const createdAt = new Date(user.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <tr className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
              [
                "bg-blue-500",
                "bg-purple-500",
                "bg-pink-500",
                "bg-orange-500",
                "bg-teal-500",
              ][index % 5]
            }`}
          >
            {user.email?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-slate-900 dark:text-white text-sm">
              {user.user_metadata?.full_name || user.email?.split("@")[0]}
            </p>
            <p className="text-xs text-slate-500">{user.email}</p>
          </div>
        </div>
      </td>
      <td className="py-3 px-4">
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            isBanned
              ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
              : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
          }`}
        >
          {isBanned ? "Banned" : "Active"}
        </span>
      </td>
      <td className="py-3 px-4 text-sm text-slate-500 dark:text-slate-400">
        {user.user_metadata?.role === "admin" ? (
          <span className="px-2 py-1 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 rounded-full text-xs font-medium">
            Admin
          </span>
        ) : (
          <span className="text-slate-400">User</span>
        )}
      </td>
      <td className="py-3 px-4 text-sm text-slate-500 dark:text-slate-400">
        {createdAt}
      </td>
      <td className="py-3 px-4">
        <AdminActions userId={user.id} isBanned={isBanned} />
      </td>
    </tr>
  );
}

// Chat Log Component
function ChatLogItem({
  log,
}: {
  log: ChatMessage & { profiles: Pick<Profile, "email"> | null };
}) {
  return (
    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-0.5 rounded text-xs font-bold ${
              log.role === "user"
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                : "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
            }`}
          >
            {log.role.toUpperCase()}
          </span>
          {log.profiles?.email && (
            <span className="text-xs text-slate-500">{log.profiles.email}</span>
          )}
        </div>
        <span className="text-xs text-slate-400">
          {new Date(log.created_at).toLocaleString()}
        </span>
      </div>
      <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-3">
        {log.content}
      </p>
    </div>
  );
}

export default async function AdminDashboard() {
  const supabase = await createClient();

  // 1. Security Check
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const adminEmail = process.env.ADMIN_EMAIL || "";
  const isAdminByEmail = user?.email === adminEmail;
  const isAdminByRole = user?.user_metadata?.role === "admin";

  if (!user || (!isAdminByEmail && !isAdminByRole)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <div className="p-8 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl text-center max-w-md border border-slate-200 dark:border-slate-800">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Access Denied
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            You don&apos;t have permission to access this area.
            <br />
            <span className="text-xs text-slate-400">
              ({user?.email || "Guest"})
            </span>
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-slate-700 text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  // 2. Fetch Data
  const [
    { count: usersCount },
    { count: sessionsCount },
    { count: messagesCount },
    { data: apiUsage },
    { data: profiles },
    { data: logs },
    { data: recentSessions },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("chat_sessions").select("*", { count: "exact", head: true }),
    supabase.from("chat_messages").select("*", { count: "exact", head: true }),
    supabase.from("api_usage").select("tokens_used"),
    supabaseAdmin.auth.admin.listUsers(),
    supabaseAdmin
      .from("chat_messages")
      .select(`*, profiles (email)`)
      .order("created_at", { ascending: false })
      .limit(20),
    supabaseAdmin
      .from("chat_sessions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const totalTokens =
    apiUsage?.reduce((acc, curr) => acc + (curr.tokens_used || 0), 0) || 0;
  const avgTokensPerSession = sessionsCount
    ? Math.round(totalTokens / sessionsCount)
    : 0;

  const stats = [
    {
      label: "Total Users",
      value: usersCount || 0,
      icon: Users,
      color: "text-blue-500",
      bg: "bg-blue-100 dark:bg-blue-900/20",
      trend: "up" as const,
      trendValue: "+12%",
    },
    {
      label: "Chat Sessions",
      value: sessionsCount || 0,
      icon: MessageSquare,
      color: "text-violet-500",
      bg: "bg-violet-100 dark:bg-violet-900/20",
      trend: "up" as const,
      trendValue: "+8%",
    },
    {
      label: "Total Messages",
      value: messagesCount || 0,
      icon: Database,
      color: "text-fuchsia-500",
      bg: "bg-fuchsia-100 dark:bg-fuchsia-900/20",
    },
    {
      label: "Tokens Used",
      value: totalTokens.toLocaleString(),
      icon: Zap,
      color: "text-amber-500",
      bg: "bg-amber-100 dark:bg-amber-900/20",
    },
    {
      label: "Avg Tokens/Session",
      value: avgTokensPerSession.toLocaleString(),
      icon: Activity,
      color: "text-emerald-500",
      bg: "bg-emerald-100 dark:bg-emerald-900/20",
    },
    {
      label: "Active Today",
      value:
        profiles?.users?.filter((u: User) => {
          const lastSignIn = u.last_sign_in_at
            ? new Date(u.last_sign_in_at)
            : null;
          return lastSignIn && Date.now() - lastSignIn.getTime() < 86400000;
        }).length || 0,
      icon: TrendingUp,
      color: "text-cyan-500",
      bg: "bg-cyan-100 dark:bg-cyan-900/20",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-xl">
                <ShieldAlert className="text-red-600 w-7 h-7" />
              </div>
              Admin Command Center
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Welcome back, Administrator
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white dark:bg-slate-800 px-4 py-2 rounded-xl text-sm text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              {user.email}
            </div>
            <Link
              href="/"
              className="px-4 py-2 bg-slate-900 dark:bg-slate-700 text-white rounded-xl hover:bg-slate-800 transition-colors text-sm"
            >
              Back to App
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {stats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Management - Full Width on Mobile, 2 cols on Desktop */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-500" />
                  User Management
                </h2>
                <span className="text-xs bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full text-slate-500">
                  {profiles?.users?.length || 0} users
                </span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-800/50">
                  <tr className="text-left text-xs text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4 font-medium">User</th>
                    <th className="py-3 px-4 font-medium">Status</th>
                    <th className="py-3 px-4 font-medium">Role</th>
                    <th className="py-3 px-4 font-medium">Joined</th>
                    <th className="py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {((profiles?.users as User[]) || [])
                    .slice(0, 10)
                    .map((u, i) => (
                      <UserRow key={u.id} user={u} index={i} />
                    ))}
                </tbody>
              </table>
            </div>
            {(profiles?.users?.length || 0) === 0 && (
              <div className="p-8 text-center text-slate-400">
                No users found
              </div>
            )}
          </div>

          {/* Recent Sessions */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-violet-500" />
                Recent Sessions
              </h2>
            </div>
            <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto">
              {(recentSessions || []).map(
                (session: {
                  id: string;
                  title: string | null;
                  mode: string | null;
                  created_at: string;
                }) => (
                  <div
                    key={session.id}
                    className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium text-sm text-slate-900 dark:text-white line-clamp-1">
                        {session.title || "Untitled Session"}
                      </p>
                      <p className="text-xs text-slate-500">
                        {session.mode || "Unknown"} •{" "}
                        {new Date(session.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <form action="/api/admin/sessions/delete" method="POST">
                      <input
                        type="hidden"
                        name="sessionId"
                        value={session.id}
                      />
                      <button
                        type="submit"
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </form>
                  </div>
                ),
              )}
              {(recentSessions || []).length === 0 && (
                <div className="p-4 text-center text-slate-400 text-sm">
                  No sessions found
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Chat Logs */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-purple-500" />
                Live Chat Logs
              </h2>
              <span className="flex items-center gap-2 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Real-time
              </span>
            </div>
          </div>
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto">
            {(
              (logs || []) as (ChatMessage & {
                profiles: Pick<Profile, "email"> | null;
              })[]
            ).map((log) => (
              <ChatLogItem key={log.id} log={log} />
            ))}
            {(logs || []).length === 0 && (
              <div className="col-span-2 p-8 text-center text-slate-400">
                No chat logs found
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
