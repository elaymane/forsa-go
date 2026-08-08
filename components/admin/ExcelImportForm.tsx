"use client";

import { useActionState } from "react";
import { Loader2, Upload } from "lucide-react";
import { importOpportunitiesAction, type AdminFormState } from "@/app/admin/actions";

const initialState: AdminFormState = {};

export default function ExcelImportForm() {
  const [state, formAction, isPending] = useActionState(importOpportunitiesAction, initialState);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-dashed border-black/15 bg-black/[0.02] p-4 text-xs leading-relaxed text-gray-500 dark:border-white/15 dark:bg-white/5 dark:text-gray-400">
        <p className="mb-1 font-medium text-gray-700 dark:text-gray-300">Expected columns (any order, any casing):</p>
        <p>
          <code>Title</code>, <code>Organization</code>, <code>Location</code> — required. <code>Type</code>,{" "}
          <code>Level</code>, <code>Image</code>, <code>Description</code>, <code>Tags</code> (comma-separated),{" "}
          <code>Specialization</code> (تخصص), <code>Grade</code> (الدرجة), <code>PositionsCount</code> (عدد المناصب),{" "}
          <code>Website</code>, <code>ExamDate</code> (written exam), <code>OralExamDate</code>,{" "}
          <code>DeadlineDate</code> — optional. Leave date cells blank if unknown.
        </p>
      </div>

      <form action={formAction} className="space-y-4">
        <input
          name="file"
          type="file"
          accept=".xlsx,.xls"
          required
          className="block w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-purple-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-purple-700 hover:file:bg-purple-200 dark:text-gray-300 dark:file:bg-purple-500/20 dark:file:text-purple-300"
        />

        {state.error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
            {state.error}
          </p>
        )}
        {state.success && (
          <p className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-600 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-300">
            {state.success}
          </p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="flex items-center justify-center gap-2 rounded-xl bg-[#7C3AED] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#6D28D9] disabled:opacity-60"
        >
          {isPending ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
          Import file
        </button>
      </form>
    </div>
  );
}
