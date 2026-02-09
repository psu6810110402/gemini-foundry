"use client";
import { useState } from "react";
import { User } from "@supabase/supabase-js";

interface UserTableProps {
  users: User[];
}

export function UserTable({ users }: UserTableProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleBan = async (userId: string) => {
    if (!confirm("คุณแน่ใจหรือไม่ที่จะแบน/เลิกแบนผู้ใช้นี้?")) return;

    setLoadingId(userId);
    try {
      const res = await fetch("/api/admin/users/ban", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action: "ban" }),
      });

      if (res.ok) {
        alert("แบนผู้ใช้สำเร็จ! กรุณารีเฟรชเพื่อดูการเปลี่ยนแปลง");
      } else {
        const data = await res.json();
        alert(`ผิดพลาด: ${data.error}`);
      }
    } catch (error) {
      console.error(error);
      alert("ไม่สามารถแบนผู้ใช้ได้");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left border-collapse">
        <thead className="bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-gray-300">
          <tr>
            <th className="p-3 border-b dark:border-slate-700">อีเมล</th>
            <th className="p-3 border-b dark:border-slate-700">สร้างเมื่อ</th>
            <th className="p-3 border-b dark:border-slate-700">การกระทำ</th>
          </tr>
        </thead>
        <tbody className="divide-y dark:divide-slate-700">
          {users.map((user) => (
            <tr
              key={user.id}
              className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
            >
              <td className="p-3 font-medium text-slate-800 dark:text-slate-200">
                {user.email}
                {user.banned_until && (
                  <span className="ml-2 px-2 py-0.5 text-xs bg-red-100 text-red-600 rounded-full">
                    ถูกแบน
                  </span>
                )}
              </td>
              <td className="p-3 text-slate-500 dark:text-slate-400">
                {new Date(user.created_at).toLocaleDateString()}
              </td>
              <td className="p-3">
                <button
                  onClick={() => handleBan(user.id)}
                  disabled={loadingId === user.id}
                  className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors disabled:opacity-50 text-xs font-semibold"
                >
                  {loadingId === user.id ? "กำลังดำเนินการ..." : "แบนผู้ใช้"}
                </button>
              </td>
            </tr>
          ))}
          {users.length === 0 && (
            <tr>
              <td colSpan={3} className="p-4 text-center text-gray-500">
                ไม่พบผู้ใช้
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
