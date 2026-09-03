"use client";

import { useState, useActionState } from "react";
import { Bug, X, CheckCircle2 } from "lucide-react";
import { submitProblemReportAction, type ReportProblemState } from "@/app/actions";
import Portal from "@/components/ui/Portal";

const initialState: ReportProblemState = {};

export default function ReportProblemButton({ label }: { label: string }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(submitProblemReportAction, initialState);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-left transition hover:bg-red-500/10"
      >
        <Bug size={18} className="shrink-0 text-red-500" />
        <span className="text-sm">{label}</span>
      </button>

      {open && (
        <Portal>
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
            <div className="relative w-full max-w-sm rounded-3xl border border-black/10 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-[#0B1220]">
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="absolute right-4 top-4 rounded-lg p-1.5 text-gray-400 transition hover:bg-black/5 dark:hover:bg-white/10"
              >
                <X size={16} />
              </button>

              {state.success ? (
                <div className="py-4 text-center">
                  <CheckCircle2 size={32} className="mx-auto mb-3 text-emerald-500" />
                  <p className="font-semibold">Thanks — we got it.</p>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    We'll look into it as soon as possible.
                  </p>
                  <button
                    onClick={() => setOpen(false)}
                    className="mt-4 rounded-xl bg-purple-500 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-600"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <form action={formAction}>
                  <h2 className="mb-1 flex items-center gap-2 font-bold">
                    <Bug size={16} className="text-red-500" /> Report a technical problem
                  </h2>
                  <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                    Found a bug, or something not working right? Describe it and it goes straight to the admin.
                  </p>
                  <input type="hidden" name="pageUrl" value={typeof window !== "undefined" ? window.location.pathname : ""} />
                  <textarea
                    name="description"
                    required
                    rows={4}
                    placeholder="What happened, and what did you expect instead?"
                    className="w-full rounded-xl border border-gray-300 bg-gray-100 p-3 text-sm outline-none transition focus:ring-2 focus:ring-purple-500 dark:border-white/10 dark:bg-white/5"
                  />
                  {state.error && <p className="mt-2 text-xs text-red-500">{state.error}</p>}
                  <button
                    type="submit"
                    disabled={isPending}
                    className="mt-3 w-full rounded-xl bg-red-500 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600 disabled:opacity-60"
                  >
                    {isPending ? "Sending…" : "Send report"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </Portal>
      )}
    </>
  );
}
