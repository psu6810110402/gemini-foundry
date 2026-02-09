import { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, LayoutDashboard, Shield } from "lucide-react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white p-6 flex flex-col fixed h-full shadow-xl z-50">
        <div className="flex items-center gap-3 mb-10">
          <Shield className="w-8 h-8 text-violet-400" />
          <h1 className="text-xl font-bold">Admin Panel</h1>
        </div>

        <nav className="space-y-2 flex-1">
          <Link
            href="/admin"
            className="flex items-center gap-3 p-3 rounded-xl bg-white/10 text-white font-medium hover:bg-white/20 transition-all"
          >
            <LayoutDashboard className="w-5 h-5" />
            Overview
          </Link>
          {/* Add more links here later */}
        </nav>

        <Link
          href="/"
          className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors mt-auto"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to App
        </Link>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">{children}</main>
    </div>
  );
}
