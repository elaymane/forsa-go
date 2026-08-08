"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Calendar, Clock, MapPin, Building2, ArrowRight, Bookmark, Trophy, BookMarked, Award, Users, Eye, Lock } from "lucide-react";
import type { Opportunity } from "@/types/opportunity";
import type { ApplicationState } from "@/lib/db/applications";
import { toggleSaveAction, advanceStageAction, withdrawApplicationAction } from "@/app/actions";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { matchesProfile, type UserProfileSnippet } from "@/lib/matching";
import OpportunityDetailModal from "./OpportunityDetailModal";

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
}

export default function OpportunityCard({ offer, applicationState, userProfile, guestMode }: OpportunityCardProps) {
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
      if (result.limitReached) router.push("/subscribe");
    });
  const handleAdvance = () =>
    startTransition(async () => {
      const result = await advanceStageAction(offer.id);
      if (result.limitReached) router.push("/subscribe");
      if (result.expired) alert("This opportunity's deadline has passed — you can no longer apply.");
    });
  const handleWithdraw = () => startTransition(() => withdrawApplicationAction(offer.id));

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
        onClick={() => setShowDetail(true)}
        role="button"
        aria-label={`View details for ${offer.title}`}
      >
        <img src={offer.image} alt={offer.title} loading="lazy" decoding="async" className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-black/40 px-2.5 py-1 text-[11px] text-white opacity-0 backdrop-blur transition group-hover:opacity-100">
          <Eye size={12} /> View details
        </span>

        <span className="absolute left-3 top-3 flex gap-2">
          <Badge tone={isClosed ? "danger" : "success"}>{isClosed ? "Closed" : "Open"}</Badge>
          {offer.level && <Badge tone="info">{offer.level}</Badge>}
          {isMatch && <Badge tone="primary">✨ Matches you</Badge>}
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
      <div className="space-y-5 p-6 text-[#334155] dark:text-white">
        <div className="flex flex-wrap gap-2 text-sm">
          <span className="flex items-center gap-2 rounded-lg border border-[#E2E8F0] bg-[#F1F5F9] px-3 py-2 dark:border-white/10 dark:bg-white/5">
            <MapPin size={14} />
            {offer.location}
          </span>

          <span className="flex items-center gap-2 rounded-lg border border-[#E2E8F0] bg-[#F1F5F9] px-3 py-2 dark:border-white/10 dark:bg-white/5">
            <Calendar size={14} />
            {offer.date}
          </span>

          <span
            className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${
              isClosed
                ? "border-red-200 bg-red-100 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
                : "border-green-200 bg-green-100 text-green-700 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-300"
            }`}
          >
            <Clock size={14} />
            {offer.deadline}
          </span>

          {offer.specialization && (
            <span className="flex items-center gap-2 rounded-lg border border-[#E2E8F0] bg-[#F1F5F9] px-3 py-2 dark:border-white/10 dark:bg-white/5">
              <BookMarked size={14} />
              {offer.specialization}
            </span>
          )}

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
            <Lock size={15} /> Sign up to Apply, Save & Track
          </Link>
        ) : (
        <div className="grid grid-cols-1 gap-2 pt-2 sm:grid-cols-2">
          <Button
            variant={stage === "accepted" ? "success" : "primary"}
            disabled={isClosed || isPending || stage === "accepted" || stage === "rejected"}
            onClick={handleAdvance}
            icon={<ArrowRight size={16} />}
          >
            {stage === "accepted" ? "Accepted" : stage === "rejected" ? "Withdrawn" : stage === null ? applyLabel : advanceLabel ?? applyLabel}
          </Button>

          <Button
            variant="secondary"
            onClick={handleSave}
            disabled={isPending}
            icon={<Bookmark size={16} className={saved ? "fill-yellow-500 text-yellow-500" : ""} />}
            iconPosition="left"
          >
            Save
          </Button>
        </div>
        )}

        {!guestMode && stage && stage !== "accepted" && stage !== "rejected" && (
          <button
            onClick={handleWithdraw}
            disabled={isPending}
            className="text-xs text-gray-400 underline decoration-dotted transition hover:text-red-500 disabled:pointer-events-none"
          >
            Withdraw application
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
      />
    )}
    </>
  );
}
