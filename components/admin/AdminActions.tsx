"use client";

import { Ban, CheckCircle, Trash2 } from "lucide-react";

interface AdminActionsProps {
  userId: string;
  isBanned: boolean;
}

export function AdminActions({ userId, isBanned }: AdminActionsProps) {
  const handleDelete = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (
      !confirm(
        "Are you sure you want to delete this user? This action cannot be undone.",
      )
    ) {
      e.preventDefault();
    }
  };

  return (
    <div className="flex gap-2">
      <form
        action={`/api/admin/users/${isBanned ? "unban" : "ban"}`}
        method="POST"
      >
        <input type="hidden" name="userId" value={userId} />
        <button
          type="submit"
          className={`p-1.5 rounded-lg transition-colors ${
            isBanned
              ? "bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400"
              : "bg-orange-100 text-orange-600 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-400"
          }`}
          title={isBanned ? "Unban User" : "Ban User"}
        >
          {isBanned ? <CheckCircle size={16} /> : <Ban size={16} />}
        </button>
      </form>
      <form action="/api/admin/users/delete" method="POST">
        <input type="hidden" name="userId" value={userId} />
        <button
          type="submit"
          className="p-1.5 bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 rounded-lg transition-colors"
          title="Delete User"
          onClick={handleDelete}
        >
          <Trash2 size={16} />
        </button>
      </form>
    </div>
  );
}
