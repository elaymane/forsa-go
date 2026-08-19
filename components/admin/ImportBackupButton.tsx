"use client";

import { useState, useRef, useTransition } from "react";
import { Upload, AlertTriangle, CheckCircle2 } from "lucide-react";
import { importBackupAction } from "@/app/admin/actions";

const CONFIRM_PHRASE = "RESTORE";

export default function ImportBackupButton() {
  const [isPending, startTransition] = useTransition();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [typed, setTyped] = useState("");
  const [result, setResult] = useState<{
    error?: string;
    restoredOpportunities?: number;
    restoredApplications?: number;
    skippedApplications?: number;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canConfirm = typed === CONFIRM_PHRASE && selectedFile !== null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setSelectedFile(file);
    setResult(null);
    setTyped("");
  };

  const handleConfirm = () => {
    if (!selectedFile) return;
    startTransition(async () => {
      const text = await selectedFile.text();
      const res = await importBackupAction(text);
      setResult(res);
      setSelectedFile(null);
      setTyped("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    });
  };

  return (
    <div>
      <input ref={fileInputRef} type="file" accept="application/json" onChange={handleFileChange} className="hidden" id="backup-file-input" />

      {!selectedFile ? (
        <label
          htmlFor="backup-file-input"
          className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-black/10 bg-white/70 px-3 py-2 text-sm font-medium transition hover:bg-black/5 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
        >
          <Upload size={15} /> Import backup
        </label>
      ) : (
        <div className="rounded-2xl border-2 border-amber-400 bg-amber-50 p-4 dark:border-amber-500/50 dark:bg-amber-500/10">
          <div className="mb-2 flex items-center gap-2 font-bold text-amber-700 dark:text-amber-300">
            <AlertTriangle size={18} />
            Restore from {selectedFile.name}?
          </div>
          <p className="mb-3 text-sm text-amber-700 dark:text-amber-300">
            This <strong>replaces all current opportunities</strong> with the ones in this backup, and restores
            tracking data (saved/applied status). User accounts and organization logos are never touched. Type{" "}
            <strong>{CONFIRM_PHRASE}</strong> to confirm.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <input
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder={CONFIRM_PHRASE}
              className="rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-sm dark:border-amber-500/40 dark:bg-black/20"
            />
            <button
              onClick={handleConfirm}
              disabled={!canConfirm || isPending}
              className="rounded-lg bg-amber-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isPending ? "Restoring…" : "Yes, restore"}
            </button>
            <button
              onClick={() => {
                setSelectedFile(null);
                setTyped("");
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
              disabled={isPending}
              className="rounded-lg border border-black/10 px-3 py-1.5 text-sm dark:border-white/10"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {result?.error && <p className="mt-1 text-xs text-red-500">{result.error}</p>}
      {result?.restoredOpportunities !== undefined && (
        <div className="mt-2 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
          <CheckCircle2 size={14} className="mt-0.5 shrink-0" />
          <span>
            Restored {result.restoredOpportunities} opportunities and {result.restoredApplications} tracked
            applications.
            {!!result.skippedApplications && ` Skipped ${result.skippedApplications} (user no longer exists).`}
          </span>
        </div>
      )}
    </div>
  );
}
