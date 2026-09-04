"use client";

import { X, Sparkles } from "lucide-react";
import Portal from "@/components/ui/Portal";

interface ComingSoonPopupProps {
  title: string;
  body: string;
  closeLabel: string;
  onClose: () => void;
}

export default function ComingSoonPopup({ title, body, closeLabel, onClose }: ComingSoonPopupProps) {
  return (
    <Portal>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        <div className="relative w-full max-w-sm rounded-3xl border border-black/10 bg-white p-6 text-center shadow-2xl dark:border-white/10 dark:bg-[#0B1220]">
          <button
            onClick={onClose}
            aria-label={closeLabel}
            className="absolute right-4 top-4 rounded-lg p-1 text-gray-400 transition hover:bg-black/5 dark:hover:bg-white/10"
          >
            <X size={16} />
          </button>

          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 text-white shadow-lg shadow-purple-500/30">
            <Sparkles size={24} />
          </div>

          <h2 className="mb-2 text-lg font-bold">{title}</h2>
          <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">{body}</p>

          <button
            onClick={onClose}
            className="w-full rounded-xl bg-[#7C3AED] py-2.5 text-sm font-semibold text-white transition hover:bg-[#6D28D9]"
          >
            {closeLabel}
          </button>
        </div>
      </div>
    </Portal>
  );
}
