import { ChatMessage, Profile } from "@/types/supabase";

interface ContentLogProps {
  // We extend ChatMessage to include the joined profile data
  logs: (ChatMessage & { profiles: Pick<Profile, "email"> | null })[];
}

export function ContentLog({ logs }: ContentLogProps) {
  return (
    <div className="space-y-3 h-[500px] overflow-y-auto pr-2 custom-scrollbar">
      {logs.map((log) => (
        <div
          key={log.id}
          className="p-3 bg-gray-50 dark:bg-slate-800/50 rounded-lg border border-gray-100 dark:border-slate-700 text-sm"
        >
          <div className="flex justify-between items-center text-gray-400 dark:text-slate-500 mb-2 text-xs">
            <span
              className={`font-bold px-2 py-0.5 rounded ${
                log.role === "user"
                  ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                  : "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
              }`}
            >
              {log.role.toUpperCase()}
            </span>
            <span>{new Date(log.created_at).toLocaleString()}</span>
          </div>

          {log.profiles?.email && (
            <div className="text-xs text-slate-500 mb-1">
              จาก: {log.profiles.email}
            </div>
          )}

          <div className="text-gray-800 dark:text-slate-200 break-words font-mono bg-white dark:bg-slate-900 p-2 rounded border border-gray-100 dark:border-slate-800">
            {log.content.length > 300
              ? log.content.substring(0, 300) + "..."
              : log.content}
          </div>
        </div>
      ))}
      {logs.length === 0 && (
        <div className="text-center text-gray-500 py-10">ไม่พบบันทึก</div>
      )}
    </div>
  );
}
