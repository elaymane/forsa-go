"use client";

import { useState, useActionState } from "react";
import { Plus, X, Loader2 } from "lucide-react";
import { updateOrganizationProfileAction, type AdminFormState } from "@/app/admin/actions";
import Portal from "@/components/ui/Portal";

const initialState: AdminFormState = {};
const inputClass =
  "w-full rounded-xl border border-gray-300 bg-gray-100 px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-purple-500 dark:border-white/10 dark:bg-white/5";
const labelClass = "mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400";

export default function CreateOrganizationButton() {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(updateOrganizationProfileAction, initialState);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-xl bg-[#7C3AED] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#6D28D9]"
      >
        <Plus size={16} /> Add organization
      </button>

      {open && (
        <Portal>
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md" onClick={() => setOpen(false)}>
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-3xl border border-black/10 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-[#0b1020]"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold">Add organization</h2>
                <button onClick={() => setOpen(false)} className="rounded-full bg-black/5 p-2 hover:scale-110 dark:bg-white/10">
                  <X size={16} />
                </button>
              </div>

              {state.success ? (
                <div className="space-y-4">
                  <p className="rounded-xl border border-green-200 bg-green-50 px-3 py-3 text-sm text-green-700 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-300">
                    {state.success}
                  </p>
                  <button
                    onClick={() => setOpen(false)}
                    className="w-full rounded-xl bg-[#7C3AED] py-2.5 text-sm font-semibold text-white transition hover:bg-[#6D28D9]"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form action={formAction} className="space-y-4">
                  <div>
                    <label className={labelClass}>Name *</label>
                    <input name="name" required className={inputClass} placeholder="e.g. OFPPT" />
                    <p className="mt-1 text-xs text-gray-400">
                      Use this exact name in the Excel/admin "Organization" field to link opportunities here.
                    </p>
                  </div>
                  <div>
                    <label className={labelClass}>Logo URL (optional)</label>
                    <input name="logo" type="url" className={inputClass} placeholder="https://..." />
                  </div>
                  <div>
                    <label className={labelClass}>Website (optional)</label>
                    <input name="website" type="url" className={inputClass} placeholder="https://..." />
                  </div>
                  <div>
                    <label className={labelClass}>Description (optional)</label>
                    <textarea name="description" rows={2} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>SEO keywords (optional, comma-separated)</label>
                    <input name="keywords" className={inputClass} placeholder="e.g. concours OFPPT, formation professionnelle Maroc" />
                    <p className="mt-1 text-xs text-gray-400">Helps this organization's page rank for these searches.</p>
                  </div>

                  {state.error && (
                    <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
                      {state.error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={isPending}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#7C3AED] py-2.5 text-sm font-semibold text-white transition hover:bg-[#6D28D9] disabled:opacity-60"
                  >
                    {isPending && <Loader2 size={16} className="animate-spin" />}
                    Create organization
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
