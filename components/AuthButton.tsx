"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  LogOut,
  User as UserIcon,
  Trash2,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { AuthModal } from "@/components/auth/AuthModal";

export function AuthButton() {
  const { user, signOut } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleDelete = async () => {
    if (
      !confirm(
        "⚠️ คุณแน่ใจหรือไม่ที่จะลบบัญชี?\n\nการดำเนินการนี้จะลบประวัติการแชทและข้อมูลทั้งหมดถาวร ไม่สามารถยกเลิกได้",
      )
    )
      return;

    setIsDeleting(true);
    try {
      const response = await fetch("/api/auth/delete", { method: "DELETE" });
      if (response.ok) {
        await signOut();
      } else {
        alert("ไม่สามารถลบบัญชีได้ กรุณาลองใหม่อีกครั้ง");
      }
    } catch {
      alert("เกิดข้อผิดพลาดขณะลบบัญชี");
    } finally {
      setIsDeleting(false);
    }
  };

  // Check if user is admin
  const isAdmin =
    user?.user_metadata?.role === "admin" ||
    user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;

  if (user) {
    return (
      <div className="flex items-center gap-3">
        {/* Admin Badge & Link */}
        {isAdmin && (
          <Link
            href="/admin"
            className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-red-500 to-rose-600 text-white text-sm font-medium rounded-lg hover:from-red-600 hover:to-rose-700 transition-all shadow-sm"
          >
            <ShieldCheck className="w-4 h-4" />
            Admin
          </Link>
        )}

        <Link
          href="/profile"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          {user.user_metadata?.avatar_url ? (
            <Image
              src={user.user_metadata.avatar_url}
              alt="Profile"
              width={32}
              height={32}
              className="rounded-full border border-slate-300 dark:border-slate-600"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <UserIcon className="w-4 h-4 text-white" />
            </div>
          )}
          <span className="text-sm font-medium hidden md:block text-slate-700 dark:text-slate-300">
            {user.user_metadata?.full_name ||
              user.email?.split("@")[0] ||
              "User"}
          </span>
        </Link>

        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          title="ลบบัญชี"
        >
          {isDeleting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Trash2 className="w-4 h-4" />
          )}
        </button>

        <button
          onClick={() => signOut()}
          className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          title="ออกจากระบบ"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowAuthModal(true)}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg text-sm font-medium transition-all shadow-md shadow-blue-500/30"
      >
        <UserIcon className="w-4 h-4" />
        เข้าสู่ระบบ
      </button>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  );
}
