"use client";

import { useEffect, useState, useTransition } from "react";
import { Tag, CheckCircle2, XCircle, Link2 } from "lucide-react";
import { lookupManagerCodeAction, linkToManagerAction } from "@/app/actions";
import { t, type Locale } from "@/lib/i18n/translations";

export default function LinkToManagerForm({ locale }: { locale: Locale }) {
  const i = t(locale).linkToManagerForm;
  const [code, setCode] = useState("");
  const [lookup, setLookup] = useState<{ name: string } | "not_found" | null>(null);
  const [checking, setChecking] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ error?: string; managerName?: string } | null>(null);

  useEffect(() => {
    if (!code.trim()) {
      setLookup(null);
      return;
    }
    setChecking(true);
    const timeout = setTimeout(async () => {
      const found = await lookupManagerCodeAction(code);
      setLookup(found ?? "not_found");
      setChecking(false);
    }, 500);
    return () => clearTimeout(timeout);
  }, [code]);

  const handleLink = () => {
    setResult(null);
    startTransition(async () => {
      const res = await linkToManagerAction(code);
      setResult(res);
      if (res.managerName) {
        setCode("");
        setLookup(null);
      }
    });
  };

  if (result?.managerName) {
    return (
      <div className="max-w-lg rounded-2xl border border-emerald-200 bg-emerald-50 p-6 dark:border-emerald-500/30 dark:bg-emerald-500/10">
        <p className="flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-300">
          <CheckCircle2 size={16} /> {i.linkedTo} {result.managerName}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-lg rounded-2xl border border-black/10 bg-white/60 p-6 dark:border-white/10 dark:bg-white/5">
      <h2 className="mb-1 flex items-center gap-2 font-semibold">
        <Link2 size={16} /> {i.title}
      </h2>
      <p className="mb-3 text-sm text-gray-500 dark:text-gray-400">{i.subtitle}</p>

      <div className="relative">
        <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder={i.invitePlaceholder}
          className="w-full rounded-xl border border-gray-300 bg-gray-100 py-2.5 pl-10 pr-3 text-sm uppercase tracking-widest outline-none transition focus:ring-2 focus:ring-purple-500 dark:border-white/10 dark:bg-white/5"
        />
      </div>

      {checking && <p className="mt-1.5 text-xs text-gray-400">{i.checking}</p>}
      {!checking && lookup && lookup !== "not_found" && (
        <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 size={13} /> {i.willLinkTo} {lookup.name}
        </p>
      )}
      {!checking && lookup === "not_found" && (
        <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-500">
          <XCircle size={13} /> {i.codeNotFound}
        </p>
      )}

      {result?.error && <p className="mt-2 text-xs text-red-500">{result.error}</p>}

      <button
        onClick={handleLink}
        disabled={isPending || !lookup || lookup === "not_found"}
        className="mt-3 rounded-xl bg-purple-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-purple-600 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {isPending ? i.linking : i.linkAccount}
      </button>
    </div>
  );
}
