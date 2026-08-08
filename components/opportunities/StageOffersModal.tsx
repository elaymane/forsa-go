"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, ChevronRight, Bookmark, FolderOpen, ArrowRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Opportunity } from "@/types/opportunity";
import type { ApplicationState } from "@/lib/db/applications";
import OpportunityDetailModal from "./OpportunityDetailModal";
import Portal from "@/components/ui/Portal";

interface StageOffersModalProps {
  title: string;
  subtitle?: string;
  offers: Opportunity[];
  applicationsMap?: Record<string, ApplicationState>;
  icon?: LucideIcon;
  onClose: () => void;
}

export default function StageOffersModal({
  title,
  subtitle,
  offers,
  applicationsMap,
  icon: Icon = Bookmark,
  onClose,
}: StageOffersModalProps) {
  const [detailOffer, setDetailOffer] = useState<Opportunity | null>(null);

  return (
    <Portal>
    <AnimatePresence>
      <motion.div
        key="drawer-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="no-scrollbar absolute right-0 top-0 flex h-full w-full max-w-md flex-col overflow-y-auto bg-white shadow-2xl dark:bg-[#0b1020] sm:max-w-[420px]"
        >
          {/* HEADER */}
          <div className="p-6 pb-5">
            <div className="mb-4 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-300">
                  <Icon size={22} />
                </div>
                <div>
                  <h2 className="text-lg font-bold">{title}</h2>
                  {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>}
                </div>
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-black/10 text-purple-600 shadow-sm transition hover:scale-110 dark:border-white/10 dark:text-purple-300"
              >
                <X size={16} />
              </button>
            </div>
            <div className="h-1 w-16 rounded-full bg-gradient-to-r from-purple-500 to-indigo-400" />
          </div>

          {/* LIST */}
          <div className="space-y-3 px-6 pb-4">
            {offers.length === 0 ? (
              <p className="p-8 text-center text-sm text-gray-500 dark:text-gray-400">Nothing here yet.</p>
            ) : (
              offers.map((offer) => (
                <button
                  key={offer.id}
                  onClick={() => setDetailOffer(offer)}
                  className="flex w-full items-center gap-3 rounded-2xl border border-black/5 bg-white p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-purple-200 hover:shadow-md dark:border-white/10 dark:bg-white/5 dark:hover:border-purple-500/30"
                >
                  <img
                    src={offer.image}
                    alt={offer.title}
                    loading="lazy"
                    decoding="async"
                    className="h-12 w-12 shrink-0 rounded-xl object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{offer.title}</p>
                    <div className="mt-0.5 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <MapPin size={11} /> {offer.location}
                    </div>
                  </div>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-50 text-purple-500 dark:bg-purple-500/10 dark:text-purple-300">
                    <ChevronRight size={15} />
                  </span>
                </button>
              ))
            )}
          </div>

          {/* FOOTER CTA */}
          <div className="p-6 pt-2">
            <Link
              href="/opportunities"
              className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-purple-50 to-indigo-50 p-4 transition hover:scale-[1.01] dark:from-purple-500/10 dark:to-indigo-500/10"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-purple-600 shadow-sm dark:bg-white/10 dark:text-purple-300">
                <FolderOpen size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">Browse all opportunities</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Explore everything available</p>
              </div>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 text-white shadow-lg">
                <ArrowRight size={16} />
              </span>
            </Link>
          </div>
        </motion.div>
      </motion.div>

      {detailOffer && (
        <OpportunityDetailModal
          key="detail-modal"
          offer={detailOffer}
          onClose={() => setDetailOffer(null)}
          applicationState={applicationsMap?.[detailOffer.id]}
        />
      )}
    </AnimatePresence>
    </Portal>
  );
}
