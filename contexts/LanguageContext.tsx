"use client";
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";

type Lang = "TH" | "EN";

const translations = {
  // UI Labels
  analyze: { TH: "วิเคราะห์โมเดลธุรกิจ", EN: "Analyze Business Model" },
  analyzing: { TH: "กำลังประมวลผล...", EN: "Analyzing..." },
  pivot: { TH: "หาทางรอด (Pivot)", EN: "Generate Pivot Strategy" },
  download: { TH: "ดาวน์โหลดรายงาน PDF", EN: "Download PDF Report" },
  export_md: { TH: "ดาวน์โหลด Markdown", EN: "Export Markdown" },
  upload_hint: {
    TH: "ลากไฟล์มาวาง หรือคลิกเพื่ออัปโหลด (BMC/Pitch Deck/PDF)",
    EN: "Drag & drop or click to upload (BMC/Pitch Deck/PDF)",
  },

  // Personas
  investor_mode: { TH: "🦈 จำลองนักลงทุน (VC)", EN: "🦈 Investor Simulator" },
  market_mode: { TH: "📊 วิเคราะห์ตลาด", EN: "📊 Market Synthesis" },
  mvp_mode: { TH: "🔧 สร้างแผน MVP", EN: "🔧 MVP Blueprint" },

  // Placeholders
  market_placeholder: {
    TH: "วางข้อมูลดิบที่นี่ เช่น สถิติตลาด ข้อมูลคู่แข่ง...",
    EN: "Paste raw market data here...",
  },
  idea_placeholder: {
    TH: "อธิบายไอเดียของคุณ...",
    EN: "Describe your startup idea...",
  },
  followup_placeholder: {
    TH: "ถามคำถามเพิ่มเติม...",
    EN: "Ask follow-up questions...",
  },

  // Actions
  generate: { TH: "สร้างแผน", EN: "Generate Blueprint" },
  send: { TH: "ส่ง", EN: "Send" },
  reset: { TH: "เริ่มใหม่", EN: "Reset" },

  // Labels
  active: { TH: "กำลังใช้งาน", EN: "Active" },
  language: { TH: "ภาษา", EN: "Language" },
  theme: { TH: "ธีม", EN: "Theme" },

  // Navigation
  home: { TH: "หน้าหลัก", EN: "Home" },
  profile: { TH: "โปรไฟล์", EN: "Profile" },
  admin: { TH: "แอดมิน", EN: "Admin" },
  sign_in: { TH: "เข้าสู่ระบบ", EN: "Sign In" },
  sign_out: { TH: "ออกจากระบบ", EN: "Sign Out" },
  sign_up: { TH: "สมัครสมาชิก", EN: "Sign Up" },

  // Sidebar
  history: { TH: "ประวัติการสนทนา", EN: "Chat History" },
  new_chat: { TH: "สนทนาใหม่", EN: "New Chat" },
  no_history: { TH: "ยังไม่มีประวัติ", EN: "No history yet" },
  sign_in_to_save: {
    TH: "เข้าสู่ระบบเพื่อบันทึกประวัติ",
    EN: "Sign in to save history",
  },
  delete_chat: { TH: "ลบการสนทนา", EN: "Delete chat" },
  confirm_delete: {
    TH: "คุณแน่ใจหรือไม่ที่จะลบ?",
    EN: "Are you sure you want to delete?",
  },

  // Auth
  welcome_back: { TH: "ยินดีต้อนรับกลับ", EN: "Welcome Back" },
  create_account: { TH: "สร้างบัญชีใหม่", EN: "Create Account" },
  email: { TH: "อีเมล", EN: "Email" },
  password: { TH: "รหัสผ่าน", EN: "Password" },
  no_account: { TH: "ยังไม่มีบัญชี?", EN: "Don't have an account?" },
  have_account: { TH: "มีบัญชีอยู่แล้ว?", EN: "Already have an account?" },
  continue_with_google: {
    TH: "ดำเนินการต่อด้วย Google",
    EN: "Continue with Google",
  },
  registration_success: {
    TH: "สมัครสำเร็จ! กรุณาตรวจสอบอีเมล",
    EN: "Registration successful! Please check your email",
  },

  // Profile
  full_name: { TH: "ชื่อเต็ม", EN: "Full Name" },
  member_since: { TH: "สมาชิกตั้งแต่", EN: "Member Since" },
  total_sessions: { TH: "เซสชันทั้งหมด", EN: "Total Sessions" },
  settings: { TH: "การตั้งค่า", EN: "Settings" },
  select_language: {
    TH: "เลือกภาษาที่ต้องการ",
    EN: "Select your preferred language",
  },
  sign_out_desc: { TH: "ออกจากบัญชีของคุณ", EN: "Sign out of your account" },
  back: { TH: "กลับ", EN: "Back" },
  please_sign_in: { TH: "กรุณาเข้าสู่ระบบ", EN: "Please Sign In" },
  go_home: { TH: "กลับหน้าหลัก", EN: "Go to Home" },

  // Admin
  admin_dashboard: { TH: "ศูนย์บัญชาการแอดมิน", EN: "Admin Command Center" },
  welcome_admin: {
    TH: "ยินดีต้อนรับกลับ, ผู้ดูแลระบบ",
    EN: "Welcome back, Administrator",
  },
  total_users: { TH: "ผู้ใช้ทั้งหมด", EN: "Total Users" },
  total_sessions_admin: { TH: "เซสชันการสนทนา", EN: "Chat Sessions" },
  total_messages: { TH: "ข้อความทั้งหมด", EN: "Total Messages" },
  tokens_used: { TH: "โทเคนที่ใช้", EN: "Tokens Used" },
  user_management: { TH: "จัดการผู้ใช้งาน", EN: "User Management" },
  recent_users: { TH: "ผู้ใช้ 50 คนล่าสุด", EN: "Last 50 users" },
  live_chat_logs: { TH: "บันทึกแชทสด", EN: "Live Chat Logs" },
  realtime: { TH: "เรียลไทม์", EN: "Realtime" },
  access_denied: { TH: "เข้าถึงถูกปฏิเสธ", EN: "Access Denied" },
  no_permission: {
    TH: "คุณไม่มีสิทธิ์เข้าถึงส่วนนี้",
    EN: "You don't have permission to access this section",
  },

  // Errors
  rate_limit: {
    TH: "กรุณารอสักครู่ก่อนส่งคำขอใหม่",
    EN: "Please wait before making another request",
  },
  error_occurred: { TH: "เกิดข้อผิดพลาด", EN: "An error occurred" },
  try_again: { TH: "ลองอีกครั้ง", EN: "Try again" },

  // General
  loading: { TH: "กำลังโหลด...", EN: "Loading..." },
  save: { TH: "บันทึก", EN: "Save" },
  cancel: { TH: "ยกเลิก", EN: "Cancel" },
  edit: { TH: "แก้ไข", EN: "Edit" },
  delete: { TH: "ลบ", EN: "Delete" },
  or: { TH: "หรือ", EN: "or" },
};

type TranslationKey = keyof typeof translations;

interface LanguageContextType {
  lang: Lang;
  toggleLang: () => void;
  setLang: (lang: Lang) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "EN", // Default to English
  toggleLang: () => {},
  setLang: () => {},
  t: () => "",
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("EN"); // Default to English

  // Persist language preference
  useEffect(() => {
    const saved = localStorage.getItem("lang") as Lang;
    if (saved && (saved === "EN" || saved === "TH")) {
      setLangState(saved);
    }
  }, []);

  const setLang = (newLang: Lang) => {
    setLangState(newLang);
    localStorage.setItem("lang", newLang);
  };

  const toggleLang = () => {
    const newLang = lang === "TH" ? "EN" : "TH";
    setLang(newLang);
  };

  const t = (key: TranslationKey): string => translations[key]?.[lang] || key;

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
