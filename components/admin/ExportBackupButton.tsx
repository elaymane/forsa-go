"use client";

import { useState, useTransition } from "react";
import { Download, Loader2 } from "lucide-react";
import { exportBackupAction } from "@/app/admin/actions";

export default function ExportBackupButton() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleExport = () => {
    setError(null);
    startTransition(async () => {
      const result = await exportBackupAction();
      if (result.error || !result.data) {
        setError(result.error ?? "Export failed — try again.");
        return;
      }
      const blob = new Blob([result.data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const timestamp = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `forsa-go-backup-${timestamp}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  };

  return (
    <div>
      <button
        onClick={handleExport}
        disabled={isPending}
        className="flex items-center gap-1.5 rounded-xl border border-black/10 bg-white/70 px-3 py-2 text-sm font-medium transition hover:bg-black/5 disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
      >
        {isPending ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
        Export backup
      </button>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
