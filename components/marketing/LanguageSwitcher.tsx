"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Globe } from "lucide-react";
import { setLocaleAction } from "@/app/actions";
import type { Locale } from "@/lib/i18n/translations";

export default function LanguageSwitcher({ locale }: { locale: Locale }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const switchTo = (next: Locale) => {
    if (next === locale) return;
    startTransition(async () => {
      await setLocaleAction(next);
      router.refresh();
    });
  };

  return (
    <div className="flex items-center gap-1 rounded-xl border border-black/10 p-1 text-xs font-medium dark:border-white/10">
      <Globe size={13} className="ml-1.5 text-gray-400" />
      <button
        onClick={() => switchTo("en")}
        disabled={isPending}
        className={`rounded-lg px-2 py-1 transition ${
          locale === "en" ? "bg-[#7C3AED] text-white" : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        }`}
      >
        EN
      </button>
      <button
        onClick={() => switchTo("fr")}
        disabled={isPending}
        className={`rounded-lg px-2 py-1 transition ${
          locale === "fr" ? "bg-[#7C3AED] text-white" : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
        }`}
      >
        FR
      </button>
    </div>
  );
}
