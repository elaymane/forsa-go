"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Loader2, Lock, Sparkles } from "lucide-react";
import { createUserConcoursAction, type AddConcoursFormState } from "@/app/actions";
import Portal from "@/components/ui/Portal";
import { FREE_CONCOURS_ADD_LIMIT } from "@/lib/subscription";
import { t, type Locale } from "@/lib/i18n/translations";

const TYPES = ["Concours", "Job", "Internship", "Training", "Scholarship"];
const initialState: AddConcoursFormState = {};

const inputClass =
  "w-full rounded-xl border border-gray-300 bg-gray-100 px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-purple-500 dark:border-white/10 dark:bg-white/5";
const labelClass = "mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400";

interface AddConcoursModalProps {
  addedCount: number;
  unlimited: boolean;
  locale: Locale;
}

export default function AddConcoursModal({ addedCount, unlimited, locale }: AddConcoursModalProps) {
  const i = t(locale).addConcoursModal;
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(createUserConcoursAction, initialState);
  const atLimit = !unlimited && addedCount >= FREE_CONCOURS_ADD_LIMIT;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-xl border border-black/10 bg-white px-3.5 py-2 text-sm font-medium transition hover:bg-black/5 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
      >
        <Plus size={16} /> {i.addAConcours}
        {!unlimited && (
          <span className="rounded-full bg-black/5 px-1.5 text-xs text-gray-500 dark:bg-white/10 dark:text-gray-400">
            {addedCount}/{FREE_CONCOURS_ADD_LIMIT}
          </span>
        )}
      </button>

      {open && (
        <Portal>
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md"
              onClick={() => setOpen(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 16 }}
                onClick={(e) => e.stopPropagation()}
                className="no-scrollbar max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-black/10 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-[#0b1020]"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-bold">{i.addAConcours}</h2>
                    <p className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <Lock size={11} /> {i.privateToYou}
                      {!unlimited && ` · ${addedCount}/${FREE_CONCOURS_ADD_LIMIT} ${i.usedOnFreePlan}`}
                    </p>
                  </div>
                  <button
                    onClick={() => setOpen(false)}
                    aria-label="Close"
                    className="rounded-full bg-black/5 p-2 transition hover:scale-110 dark:bg-white/10"
                  >
                    <X size={16} />
                  </button>
                </div>

                {atLimit && !state.success ? (
                  <div className="space-y-4 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-300">
                      <Sparkles size={22} />
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {i.addedLimitReached.replace("{limit}", String(FREE_CONCOURS_ADD_LIMIT))}
                    </p>
                    <Link
                      href="/subscribe"
                      onClick={() => setOpen(false)}
                      className="block w-full rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 py-2.5 text-sm font-semibold text-white transition hover:scale-[1.02]"
                    >
                      {i.upgrade}
                    </Link>
                  </div>
                ) : state.success ? (
                  <div className="space-y-4">
                    <p className="rounded-xl border border-green-200 bg-green-50 px-3 py-3 text-sm text-green-700 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-300">
                      {state.success}
                    </p>
                    <button
                      onClick={() => setOpen(false)}
                      className="w-full rounded-xl bg-[#7C3AED] py-2.5 text-sm font-semibold text-white transition hover:bg-[#6D28D9]"
                    >
                      {i.done}
                    </button>
                  </div>
                ) : (
                  <form action={formAction} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <label className={labelClass}>{i.title}</label>
                        <input name="title" required className={inputClass} placeholder={i.titlePlaceholder} />
                      </div>
                      <div>
                        <label className={labelClass}>{i.organization}</label>
                        <input name="organization" required className={inputClass} placeholder={i.organizationPlaceholder} />
                      </div>
                      <div>
                        <label className={labelClass}>{i.location}</label>
                        <input name="location" required className={inputClass} placeholder={i.locationPlaceholder} />
                      </div>
                      <div>
                        <label className={labelClass}>{i.type}</label>
                        <select name="type" className={inputClass} defaultValue="Concours">
                          {TYPES.map((ty) => (
                            <option key={ty} value={ty}>
                              {ty}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>{i.deadline}</label>
                        <input name="deadlineDate" type="date" className={inputClass} />
                      </div>
                      <div>
                        <label className={labelClass}>{i.writtenExamDate}</label>
                        <input name="examDate" type="date" className={inputClass} />
                      </div>
                      <div>
                        <label className={labelClass}>{i.oralExamDate}</label>
                        <input name="oralExamDate" type="date" className={inputClass} />
                      </div>
                    </div>

                    <div>
                      <label className={labelClass}>{i.notes}</label>
                      <textarea
                        name="description"
                        rows={2}
                        className={inputClass}
                        placeholder={i.notesPlaceholder}
                      />
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
                      {i.addToTracking}
                    </button>
                  </form>
                )}
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </Portal>
      )}
    </>
  );
}
