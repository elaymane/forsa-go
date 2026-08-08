"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  MapPin,
  Building2,
  Calendar,
  Clock,
  GraduationCap,
  Tag,
  BookMarked,
  Award,
  Users,
  Globe,
  Share2,
  Info,
  Check,
  CalendarPlus,
  Lock,
  Pencil,
  Send,
  Loader2,
} from "lucide-react";
import type { Opportunity } from "@/types/opportunity";
import type { ApplicationState } from "@/lib/db/applications";
import { setUserExamDateAction, advanceStageAction, withdrawApplicationAction } from "@/app/actions";
import { slugifyOrganization } from "@/lib/organizations";
import { Badge } from "@/components/ui/Badge";
import Portal from "@/components/ui/Portal";

interface OpportunityDetailModalProps {
  offer: Opportunity;
  onClose: () => void;
  applicationState?: ApplicationState;
  guestMode?: boolean;
}

/** One of the four hero-area status pills (Open/Closed, Type). */
function HeroPill({ icon: Icon, label, tone }: { icon: typeof MapPin; label: string; tone: "success" | "danger" | "primary" }) {
  const toneClass =
    tone === "success"
      ? "text-emerald-600"
      : tone === "danger"
      ? "text-red-600"
      : "text-purple-600";

  return (
    <span className="flex items-center gap-1.5 rounded-full bg-white/95 px-3.5 py-1.5 text-sm font-semibold shadow-lg backdrop-blur">
      <Icon size={14} className={toneClass} />
      <span className={toneClass}>{label}</span>
    </span>
  );
}

/** One of the info grid cells, with a large faint watermark icon. */
function InfoCell({
  icon: Icon,
  label,
  value,
  known,
  watermark: Watermark,
}: {
  icon: typeof MapPin;
  label: string;
  value: string;
  known: boolean;
  watermark: typeof MapPin;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-black/5 bg-black/[0.02] p-4 dark:border-white/5 dark:bg-white/[0.03]">
      <Watermark size={64} className="pointer-events-none absolute -right-3 -top-3 text-black/5 dark:text-white/[0.06]" />
      <div className="relative flex items-center gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
            known
              ? "bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-300"
              : "bg-black/5 text-gray-400 dark:bg-white/10 dark:text-gray-500"
          }`}
        >
          <Icon size={18} />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-gray-400">{label}</p>
          <p className={`truncate font-semibold ${known ? "" : "text-gray-400 dark:text-gray-500"}`}>{value}</p>
        </div>
      </div>
    </div>
  );
}

/**
 * A written- or oral-exam date cell. This is where the pipeline stages
 * (applied → written → oral → accepted) connect to real dates: the admin's
 * official date wins if set, otherwise the user can record their own once
 * they find out — that personal date is what the system tracks them against
 * from then on (shown on the dashboard timeline, the "confirm dates" prompt, etc).
 */
function ExamDateCell({
  offer,
  applicationState,
  kind,
}: {
  offer: Opportunity;
  applicationState?: ApplicationState;
  kind: "written" | "oral";
}) {
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);

  const officialDate = kind === "written" ? offer.examDate : offer.oralExamDate;
  const personalDate = kind === "written" ? applicationState?.userExamDate : applicationState?.userOralExamDate;
  const [value, setValue] = useState(personalDate ?? "");
  const label = kind === "written" ? "Written exam date" : "Oral exam date";
  const canAddOwnDate = true; // setUserExamDate creates the tracking row itself if needed — no need to have saved/applied first

  const save = () => {
    if (!value) return;
    startTransition(async () => {
      await setUserExamDateAction(offer.id, kind, value);
      setEditing(false);
    });
  };

  // 1. Admin has announced an official date — show it plainly, same style as any other known field.
  if (officialDate) {
    return <InfoCell icon={Calendar} label={label} value={officialDate} known watermark={Check} />;
  }

  // 2. User already recorded their own date — show it, editable.
  if (personalDate && !editing) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-indigo-200 bg-indigo-50/70 p-4 dark:border-indigo-500/30 dark:bg-indigo-500/[0.08]">
        <Calendar size={64} className="pointer-events-none absolute -right-3 -top-3 text-indigo-900/5 dark:text-white/[0.06]" />
        <div className="relative flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300">
            <Calendar size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-indigo-500 dark:text-indigo-300">{label} · added by you</p>
            <p className="truncate font-semibold">{personalDate}</p>
            <p className="mt-0.5 flex items-center gap-1 text-[11px] text-indigo-400 dark:text-indigo-400/80">
              <Lock size={10} /> Only visible to you
            </p>
          </div>
          <button
            onClick={() => setEditing(true)}
            aria-label={`Edit your ${label.toLowerCase()}`}
            className="shrink-0 rounded-lg p-1.5 text-indigo-500 transition hover:bg-indigo-100 dark:hover:bg-indigo-500/20"
          >
            <Pencil size={14} />
          </button>
        </div>
      </div>
    );
  }

  // 3. Nobody knows the date yet — this user can add their own; doing so
  // automatically starts tracking this opportunity for them if it wasn't already.
  if (canAddOwnDate) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-amber-200 bg-amber-50/70 p-4 dark:border-amber-500/30 dark:bg-amber-500/[0.08]">
        <CalendarPlus size={64} className="pointer-events-none absolute -right-3 -top-3 text-amber-900/5 dark:text-white/[0.06]" />
        <div className="relative flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-300">
            <CalendarPlus size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-amber-600 dark:text-amber-300">{label}</p>
            <div className="mt-1 flex items-center gap-1.5">
              <input
                type="date"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="rounded-lg border border-amber-300 bg-white px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-amber-400 dark:border-amber-500/40 dark:bg-black/20"
              />
              <button
                onClick={save}
                disabled={isPending || !value}
                className="rounded-lg bg-amber-500 px-2.5 py-1 text-xs font-semibold text-white transition hover:bg-amber-600 disabled:opacity-50"
              >
                Save
              </button>
            </div>
            <p className="mt-1 flex items-center gap-1 text-[11px] text-amber-500 dark:text-amber-400/80">
              <Lock size={10} /> Only visible to you, not other users
            </p>
          </div>
        </div>
      </div>
    );
  }
}

/** One cell in the bottom meta strip. */
function MetaCell({ icon: Icon, label, value }: { icon: typeof MapPin; label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300">
        <Icon size={16} />
      </div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="mt-0.5 truncate text-sm font-semibold">{value}</p>
    </div>
  );
}

const NEXT_STAGE_LABEL: Record<string, string> = {
  applied: "Mark Written Exam",
  written: "Mark Oral Exam",
  oral: "Mark Accepted 🎉",
};

const STAGE_DISPLAY_LABEL: Record<string, string> = {
  applied: "Applied",
  written: "Written Exam",
  oral: "Oral Exam",
  accepted: "Accepted",
  rejected: "Withdrawn",
};

export default function OpportunityDetailModal({ offer, onClose, applicationState, guestMode }: OpportunityDetailModalProps) {
  const [copied, setCopied] = useState(false);
  const [isApplying, startApplyTransition] = useTransition();
  const [isWithdrawing, startWithdrawTransition] = useTransition();
  const isClosed = offer.status === "closed";
  const stage = applicationState?.stage ?? null;
  const isFinal = stage === "accepted" || stage === "rejected";

  const applyLabel =
    stage === null
      ? "Apply"
      : stage === "rejected"
      ? "Withdrawn"
      : stage === "accepted"
      ? "Accepted 🎉"
      : NEXT_STAGE_LABEL[stage] ?? "Applied ✓";

  const router = useRouter();
  const handleApply = () =>
    startApplyTransition(async () => {
      const result = await advanceStageAction(offer.id);
      if (result.limitReached) router.push("/subscribe");
      if (result.expired) alert("This opportunity's deadline has passed — you can no longer apply.");
    });
  const handleWithdraw = () => startWithdrawTransition(() => withdrawApplicationAction(offer.id));

  const handleShare = async () => {
    const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/opportunities/${offer.id}` : "";
    const shareData = { title: offer.title, text: `${offer.title} — ${offer.organization}`, url: shareUrl };

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // user cancelled or share failed — fall through to clipboard
      }
    }

    if (typeof navigator !== "undefined" && navigator.clipboard && shareUrl) {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Portal>
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-0 backdrop-blur-md sm:p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="no-scrollbar h-full w-full overflow-y-auto rounded-none border-0 bg-white shadow-2xl dark:bg-[#0b1020] sm:h-auto sm:max-h-[95vh] sm:w-full sm:max-w-3xl sm:rounded-3xl sm:border sm:border-black/10 dark:sm:border-white/10"
        >
          {/* HERO */}
          <div className="relative h-56 overflow-hidden sm:h-64">
            <img src={offer.image} alt={offer.title} loading="lazy" decoding="async" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/10" />

            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-700 shadow-lg transition hover:scale-110"
            >
              <X size={18} />
            </button>

            <div className="absolute left-5 top-5 flex flex-wrap gap-2">
              <HeroPill icon={Check} label={isClosed ? "Closed" : "Open"} tone={isClosed ? "danger" : "success"} />
              <HeroPill icon={GraduationCap} label={offer.type} tone="primary" />
              {stage && (
                <HeroPill
                  icon={Send}
                  label={STAGE_DISPLAY_LABEL[stage]}
                  tone={stage === "accepted" ? "success" : stage === "rejected" ? "danger" : "primary"}
                />
              )}
            </div>

            <div className="absolute bottom-5 left-6 right-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="min-w-0">
                <h2 className="text-2xl font-bold leading-tight text-white sm:text-3xl">{offer.title}</h2>
                <Link
                  href={`/organizations/${slugifyOrganization(offer.organization)}`}
                  onClick={(e) => e.stopPropagation()}
                  className="mt-2 flex w-fit items-center gap-1.5 text-sm text-white/85 underline decoration-white/30 underline-offset-2 transition hover:text-white"
                >
                  <Building2 size={15} /> {offer.organization}
                </Link>
                <div className="mt-2 h-1 w-14 rounded-full bg-gradient-to-r from-purple-400 to-indigo-400" />
              </div>

              <div className="flex shrink-0 gap-2">
                {guestMode ? (
                  <Link
                    href="/signup?next=/opportunities"
                    className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:scale-105"
                  >
                    <Lock size={15} /> Sign up to Apply
                  </Link>
                ) : (
                  <button
                    onClick={handleApply}
                    disabled={isClosed || isFinal || isApplying}
                    className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
                  >
                    {isApplying ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                    {applyLabel}
                  </button>
                )}
                <button
                  onClick={handleShare}
                  className="flex items-center gap-1.5 rounded-xl border border-white/30 bg-black/30 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur transition hover:scale-105 hover:bg-black/50"
                >
                  {copied ? <Check size={15} /> : <Share2 size={15} />}
                  {copied ? "Copied!" : "Share"}
                </button>
              </div>
            </div>
          </div>

          {/* BODY */}
          <div className="space-y-5 p-5 sm:p-6">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <InfoCell icon={MapPin} label="Location" value={offer.location} known watermark={MapPin} />
              <InfoCell
                icon={Clock}
                label="Application deadline"
                value={offer.deadlineDate ? offer.date : "Not announced yet"}
                known={Boolean(offer.deadlineDate)}
                watermark={Calendar}
              />
              <ExamDateCell offer={offer} applicationState={applicationState} kind="written" />
              <ExamDateCell offer={offer} applicationState={applicationState} kind="oral" />
            </div>

            {offer.description && (
              <div className="relative overflow-hidden rounded-2xl border-l-4 border-purple-400 bg-purple-50/60 p-5 dark:bg-purple-500/[0.06]">
                <Building2 size={90} className="pointer-events-none absolute -right-4 -bottom-4 text-purple-900/[0.04] dark:text-white/[0.04]" />
                <div className="relative flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-300">
                    <Info size={16} />
                  </div>
                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-purple-600 dark:text-purple-300">
                      About this opportunity
                    </p>
                    <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">{offer.description}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-3 gap-4 rounded-2xl border border-black/5 bg-black/[0.015] p-5 dark:border-white/5 dark:bg-white/[0.02] sm:grid-cols-5">
              <MetaCell icon={Tag} label="Level" value={offer.level ?? "Any"} />
              <MetaCell icon={GraduationCap} label="Type" value={offer.type} />
              <MetaCell icon={BookMarked} label="Specialization" value={offer.specialization ?? "Any"} />
              <MetaCell icon={Award} label="Grade" value={offer.grade ?? "Not specified"} />
              <MetaCell
                icon={Users}
                label="Positions"
                value={offer.positionsCount != null ? String(offer.positionsCount) : "Not specified"}
              />
            </div>

            <div className="space-y-4 pt-1">
              {offer.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {offer.tags.map((tag) => (
                    <Badge key={tag} tone="neutral">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {offer.website ? (
                <a
                  href={offer.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 py-3.5 text-sm font-semibold text-white shadow-lg transition hover:scale-[1.01]"
                >
                  <Globe size={16} /> Visit Official Site
                </a>
              ) : (
                <p className="rounded-xl border border-dashed border-black/10 py-3 text-center text-xs text-gray-400 dark:border-white/10">
                  No official link added yet — check back soon.
                </p>
              )}

              {stage && stage !== "accepted" && stage !== "rejected" && (
                <button
                  onClick={handleWithdraw}
                  disabled={isWithdrawing}
                  className="w-full text-center text-xs text-gray-400 underline decoration-dotted transition hover:text-red-500 disabled:pointer-events-none"
                >
                  Withdraw application
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
    </Portal>
  );
}
