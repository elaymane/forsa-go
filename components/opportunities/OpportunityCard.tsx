"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Calendar, Clock, MapPin, Building2, ArrowRight, Bookmark, Trophy, BookMarked, Award, Users, Eye, Lock, Share2, Check, XCircle } from "lucide-react";
import { parseCities } from "@/lib/cities";
import type { Opportunity } from "@/types/opportunity";
import type { ApplicationState } from "@/lib/db/applications";
import { toggleSaveAction, advanceStageAction, withdrawApplicationAction } from "@/app/actions";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { matchesProfile, type UserProfileSnippet } from "@/lib/matching";
import OpportunityDetailModal from "./OpportunityDetailModal";
import { t, type Locale } from "@/lib/i18n/translations";
import { relativeTime } from "@/lib/formatting";
import { trackOpportunityEvent } from "@/lib/gtm";

const TAG_TONE: Record<string, "primary" | "info" | "warning" | "neutral"> = {
  concours: "primary",
  national: "info",
  "bac+2": "warning",
  "bac+3": "warning",
  "bac+5": "warning",
};

function tagTone(tag: string) {
  return TAG_TONE[tag.toLowerCase()] ?? "neutral";
}

const NEXT_STAGE_LABEL: Record<string, string> = {
  applied: "Mark Written Exam",
  written: "Mark Oral Exam",
  oral: "Mark Accepted 🎉",
};

interface OpportunityCardProps {
  offer: Opportunity;
  applicationState?: ApplicationState;
  userProfile?: UserProfileSnippet;
  /** True when viewed by a logged-out visitor — Apply/Save/Track become a signup prompt. */
  guestMode?: boolean;
  locale: Locale;
  /** Real view count for the standalone page — omitted (not shown) when not provided, never fabricated. */
  viewCount?: number;
}

export default function OpportunityCard({ offer, applicationState, userProfile, guestMode, locale, viewCount }: OpportunityCardProps) {
  const i = t(locale).opportunityCard;
  const [isPending, startTransition] = useTransition();
  const [showDetail, setShowDetail] = useState(false);
  const isClosed = offer.status === "closed";
  const isMatch = matchesProfile(offer, userProfile);

  const saved = applicationState?.saved ?? false;
  const stage = applicationState?.stage ?? null;
  const router = useRouter();

  const handleSave = () =>
    startTransition(async () => {
      const result = await toggleSaveAction(offer.id);
      if (result.limitReached) {
        router.push("/subscribe");
        return;
      }

      // Only count a save when the user changed the state from unsaved -> saved.
      if (result.ok && !saved) {
        trackOpportunityEvent("save_opportunity", {
          opportunity_id: offer.id,
          opportunity_title: offer.title,
          opportunity_type: offer.type,
          organization: offer.organization,
          location: offer.location,
        });
      }
    });
  const handleAdvance = () =>
    startTransition(async () => {
      const result = await advanceStageAction(offer.id);

      if (result.limitReached) {
        router.push("/subscribe");
        return;
      }

      if (result.expired) {
        alert("This opportunity's deadline has passed — you can no longer apply.");
        return;
      }

      // Only count the initial application, not later stage updates.
      if (result.ok && stage === null) {
        trackOpportunityEvent("apply_opportunity", {
          opportunity_id: offer.id,
          opportunity_title: offer.title,
          opportunity_type: offer.type,
          organization: offer.organization,
          location: offer.location,
        });
      }
    });
  const handleWithdraw = () => startTransition(() => withdrawApplicationAction(offer.id));

  const [copied, setCopied] = useState(false);
  const handleShare = async () => {
    const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/opportunities/${offer.id}` : "";
    const shareText = `${offer.title} — ${offer.organization}`;

    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const applyLabel =
    stage === null
      ? "Apply"
      : stage === "rejected"
      ? "Withdrawn"
      : stage === "accepted"
      ? "Accepted"
      : "Applied ✓";

  const advanceLabel = stage && NEXT_STAGE_LABEL[stage] ? NEXT_STAGE_LABEL[stage] : null;

  return (
    <>
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25 }}
      className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-md transition hover:shadow-lg dark:border-white/10 dark:bg-[#0b1020] dark:hover:shadow-[0_0_40px_rgba(168,85,247,0.15)] group"
    >
      {/* IMAGE */}
      <div
        className="relative h-56 cursor-pointer overflow-hidden"
        onClick={() => {
          setShowDetail(true);
          trackOpportunityEvent("view_opportunity", {
            opportunity_id: offer.id,
            opportunity_title: offer.title,
            opportunity_type: offer.type,
            organization: offer.organization,
            location: offer.location,
          });
        }}
        role="button"
        aria-label={`${i.viewDetails} ${offer.title}`}
      >
        <img src={offer.image} alt={`${offer.title} — ${offer.organization}`} loading="lazy" decoding="async" className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-black/40 px-2.5 py-1 text-[11px] text-white opacity-0 backdrop-blur transition group-hover:opacity-100">
          <Eye size={12} /> {i.viewDetails}
        </span>

        <span className="absolute left-3 top-3 flex gap-2">
          <Badge tone={isClosed ? "danger" : "success"}>{isClosed ? i.closed : i.open}</Badge>
          {isMatch && <Badge tone="primary">{i.matchesYou}</Badge>}
          {stage === "accepted" && (
            <Badge tone="success">
              <Trophy size={11} className="mr-0.5 inline" /> Accepted
            </Badge>
          )}
        </span>

        <div className="absolute bottom-3 left-4 right-4">
          <h2 className="text-2xl font-bold leading-snug text-white">{offer.title}</h2>
          <div className="mt-1 flex items-center gap-2 text-sm text-white/80">
            <Building2 size={14} />
            {offer.organization}
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="space-y-4 p-6 text-[#334155] dark:text-white">
        {/* ROW 1 — DATES, given real visual weight since this drives action */}
        <div
          className={`relative overflow-hidden rounded-2xl border p-4 ${
            isClosed
              ? "border-red-200 bg-gradient-to-br from-red-50 to-rose-50 dark:border-red-500/25 dark:from-red-500/[0.08] dark:to-rose-500/[0.04]"
              : "border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 dark:border-emerald-500/25 dark:from-emerald-500/[0.08] dark:to-teal-500/[0.04]"
          }`}
        >
          <Clock
            size={72}
            className={`pointer-events-none absolute -right-3 -top-3 ${
              isClosed ? "text-red-900/[0.04] dark:text-white/[0.04]" : "text-emerald-900/[0.04] dark:text-white/[0.04]"
            }`}
          />
          <div className="relative flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2.5">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                  isClosed
                    ? "bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-300"
                    : "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300"
                }`}
              >
                <Clock size={18} />
              </div>
              <div>
                <p className={`text-[11px] font-medium ${isClosed ? "text-red-500 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                  Deadline
                </p>
                <p className="text-sm font-bold">{offer.deadline}</p>
              </div>
            </div>

            {offer.date && offer.date !== offer.deadline && (
              <div className="flex items-center gap-2.5 border-l border-black/10 pl-4 dark:border-white/10">
                <Calendar size={16} className="text-gray-400" />
                <p className="text-sm text-gray-600 dark:text-gray-300">{offer.date}</p>
              </div>
            )}
          </div>
        </div>

        {/* ROW 2 — LOCATION(S) */}
        {parseCities(offer.location).length > 0 && (
          <div className="flex flex-wrap gap-2 text-sm">
            {parseCities(offer.location).map((city) => (
              <Link
                key={city}
                href={`/cities/${encodeURIComponent(city)}`}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-2 rounded-lg border border-[#E2E8F0] bg-[#F1F5F9] px-3 py-2 transition hover:border-purple-300 hover:bg-purple-50 hover:text-purple-600 dark:border-white/10 dark:bg-white/5 dark:hover:border-purple-500/40 dark:hover:bg-purple-500/10 dark:hover:text-purple-300"
              >
                <MapPin size={14} />
                {city}
              </Link>
            ))}
          </div>
        )}

        {/* ROW 3 — NIVEAU, its own row */}
        {offer.level && (
          <div className="flex flex-wrap gap-2 text-sm">
            {offer.level
              .split(",")
              .map((l) => l.trim())
              .filter(Boolean)
              .map((l) => (
                <span
                  key={l}
                  className="flex items-center gap-2 rounded-lg border border-purple-200 bg-purple-50 px-3 py-2 text-purple-700 dark:border-purple-500/20 dark:bg-purple-500/10 dark:text-purple-300"
                >
                  <Award size={14} />
                  {l}
                </span>
              ))}
          </div>
        )}

        {/* ROW 4 — SPÉCIALITÉ, GRADE, POSITIONS — its own row, separate from Niveau */}
        {(offer.specialization || offer.grade || offer.positionsCount != null) && (
          <div className="flex flex-wrap gap-2 text-sm">
            {offer.specialization &&
              offer.specialization
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
                .map((s) => (
                  <span
                    key={s}
                    className="flex items-center gap-2 rounded-lg border border-[#E2E8F0] bg-[#F1F5F9] px-3 py-2 dark:border-white/10 dark:bg-white/5"
                  >
                    <BookMarked size={14} />
                    {s}
                  </span>
                ))}

            {offer.grade && (
              <span className="flex items-center gap-2 rounded-lg border border-[#E2E8F0] bg-[#F1F5F9] px-3 py-2 dark:border-white/10 dark:bg-white/5">
                <Award size={14} />
                {offer.grade}
              </span>
            )}

            {offer.positionsCount != null && (
              <span className="flex items-center gap-2 rounded-lg border border-[#E2E8F0] bg-[#F1F5F9] px-3 py-2 dark:border-white/10 dark:bg-white/5">
                <Users size={14} />
                {offer.positionsCount} position{offer.positionsCount === 1 ? "" : "s"}
              </span>
            )}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {offer.tags.map((tag) => (
            <Badge key={tag} tone={tagTone(tag)}>
              {tag}
            </Badge>
          ))}
        </div>

        <p className="text-sm leading-relaxed text-[#64748B] dark:text-white/70">{offer.description}</p>

        {guestMode ? (
          <Link
            href={`/signup?next=/opportunities`}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#7C3AED] py-2.5 text-sm font-semibold text-white transition hover:bg-[#6D28D9]"
          >
            <Lock size={15} /> {i.signUpToApplySaveTrack}
          </Link>
        ) : (
        <div className="space-y-2 pt-2">
          <Button
            variant={stage === "accepted" ? "success" : "primary"}
            disabled={isClosed || isPending || stage === "accepted" || stage === "rejected"}
            onClick={handleAdvance}
            icon={<ArrowRight size={16} />}
            className="w-full"
          >
            {stage === "accepted" ? "Accepted" : stage === "rejected" ? "Withdrawn" : stage === null ? applyLabel : advanceLabel ?? applyLabel}
          </Button>

          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="secondary"
              onClick={handleSave}
              disabled={isPending}
              icon={<Bookmark size={16} className={saved ? "fill-yellow-500 text-yellow-500" : ""} />}
              iconPosition="left"
            >
              Save
            </Button>

            <Button
              variant="secondary"
              onClick={handleShare}
              icon={copied ? <Check size={16} className="text-emerald-500" /> : <Share2 size={16} />}
              iconPosition="left"
            >
              {copied ? "Copied" : "Share"}
            </Button>
          </div>
        </div>
        )}

        {(offer.createdAt || viewCount != null) && (
          <div className="flex items-center justify-between border-t border-black/5 pt-3 text-xs text-gray-400 dark:border-white/5">
            {offer.createdAt && (
              <span>
                {i.published} {relativeTime(offer.createdAt)}
              </span>
            )}
            {viewCount != null && (
              <span className="flex items-center gap-1">
                <Eye size={12} /> {viewCount} {i.views}
              </span>
            )}
          </div>
        )}

        {!guestMode && stage && stage !== "accepted" && stage !== "rejected" && (
          <button
            onClick={handleWithdraw}
            disabled={isPending}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-red-50/50 py-2 text-xs font-medium text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-500/20 dark:bg-red-500/[0.03] dark:hover:bg-red-500/10"
          >
            <XCircle size={13} />
            {i.withdrawApplication}
          </button>
        )}
      </div>
    </motion.div>

    {showDetail && (
      <OpportunityDetailModal
        offer={offer}
        onClose={() => setShowDetail(false)}
        applicationState={applicationState}
        guestMode={guestMode}
        locale={locale}
      />
    )}
    </>
  );
}
