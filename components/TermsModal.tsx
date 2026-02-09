// components/TermsModal.tsx
"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";

export function TermsModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if user already accepted terms
    const accepted = localStorage.getItem("gemini-foundry-terms-accepted");
    if (!accepted) {
      setIsOpen(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("gemini-foundry-terms-accepted", "true");
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-red-100 rounded-full">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">
            ⚠️ คำเตือน: AI VC สุดโหด
          </h2>
        </div>

        {/* Content */}
        <div className="text-sm text-gray-600 space-y-3 mb-6">
          <p>
            <strong>Gemini Foundry</strong> จำลองบทบาทสมมติ (Simulation)
            เพื่อทดสอบไอเดียธุรกิจของคุณ
          </p>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-amber-800 font-medium mb-2">
              คำแนะนำจาก &quot;Gemini VC&quot; อาจ:
            </p>
            <ul className="list-disc pl-4 space-y-1 text-amber-700">
              <li>มีความรุนแรงและตรงไปตรงมา</li>
              <li>วิพากษ์วิจารณ์อย่างเสียดแทง</li>
              <li>ชี้จุดอ่อนที่คุณอาจไม่อยากได้ยิน</li>
            </ul>
          </div>

          <div className="bg-gray-50 rounded-lg p-3">
            <p className="font-medium text-gray-800 mb-1">
              ข้อจำกัดความรับผิดชอบ:
            </p>
            <ul className="list-disc pl-4 space-y-1">
              <li>ข้อมูลเป็นเพียงการคาดการณ์จาก AI</li>
              <li>ไม่ใช่คำแนะนำทางการเงินหรือกฎหมาย</li>
              <li>ควรปรึกษาผู้เชี่ยวชาญก่อนตัดสินใจลงทุน</li>
            </ul>
          </div>
        </div>

        {/* Actions */}
        <button
          onClick={handleAccept}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl"
        >
          เข้าใจและยอมรับ 🚀
        </button>

        <p className="text-xs text-gray-400 text-center mt-3">
          เมื่อคลิก คุณตกลงที่จะใช้งานตามเงื่อนไขข้างต้น
        </p>
      </div>
    </div>
  );
}
