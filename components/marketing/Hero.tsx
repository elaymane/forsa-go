"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Compass, Users, Briefcase, Building2, MapPin, Calendar, Award, FileText, BookOpen, GraduationCap, ChevronLeft, ChevronRight, Flame, Sparkles } from "lucide-react";
import type { Opportunity } from "@/types/opportunity";
import { t, type Locale } from "@/lib/i18n/translations";

interface HeroProps {
  loggedIn: boolean;
  userCount: number;
  opportunityCount: number;
  organizationCount: number;
  opportunities: Opportunity[];
  locale: Locale;
}

const TYPE_ICON: Record<string, typeof Award> = {
  Concours: Award,
  Job: Briefcase,
  Internship: FileText,
  Training: BookOpen,
  Scholarship: GraduationCap,
};

const TYPE_TONE: Record<string, string> = {
  Concours: "bg-purple-600",
  Job: "bg-emerald-600",
  Internship: "bg-blue-600",
  Training: "bg-orange-600",
  Scholarship: "bg-rose-600",
};

function StatChip({ icon: Icon, value, label }: { icon: typeof Users; value: number; label: string }) {
  return (
    <div className="flex items-center gap-2.5 rounded-2xl border border-black/10 bg-white/60 px-4 py-3 dark:border-white/10 dark:bg-white/5">
      <Icon size={16} className="shrink-0 text-purple-500" />
      <div>
        <p className="text-lg font-bold leading-none">{value.toLocaleString()}</p>
        <p className="mt-0.5 text-[11px] text-gray-500 dark:text-gray-400">{label}</p>
      </div>
    </div>
  );
}

export default function Hero({ loggedIn, userCount, opportunityCount, organizationCount, opportunities, locale }: HeroProps) {
  const i = t(locale).hero;
  const f = t(locale).featuredThisWeek;
  const typeLabels = t(locale).typeLabels;

  const featured = [...opportunities]
    .filter((o) => o.status === "open")
    .sort((a, b) => a.daysLeft - b.daysLeft)
    .slice(0, 8);

  const perSlide = 2;
  const totalSlides = Math.max(1, Math.ceil(featured.length / perSlide));
  const [slide, setSlide] = useState(0);
  const visible = featured.slice(slide * perSlide, slide * perSlide + perSlide);
  const next = () => setSlide((s) => (s + 1) % totalSlides);
  const prev = () => setSlide((s) => (s - 1 + totalSlides) % totalSlides);

  return (
    <section className="ambient-glow px-6 pb-16 pt-16 sm:px-10 sm:pt-20">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 lg:grid-cols-5">
        {/* LEFT — copy */}
        <div className="lg:col-span-2">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-purple-400/30 bg-purple-500/10 px-4 py-1.5 text-xs font-medium text-purple-600 dark:text-purple-300">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-purple-500" />
            {i.badge}
          </div>

          <h1 className="font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            {i.titleLine1}
            <br />
            {i.titleLine2}{" "}
            <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
              {i.titleHighlight}
            </span>
          </h1>

          <p className="mt-5 max-w-md text-base text-gray-500 dark:text-gray-400">{i.subtitle}</p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href={loggedIn ? "/dashboard" : "/signup"}
              className="flex items-center justify-center gap-2 rounded-xl bg-[#7C3AED] px-6 py-3 text-sm font-semibold text-white transition hover:scale-[1.02] hover:bg-[#6D28D9]"
            >
              {loggedIn ? i.goToDashboard : i.getStarted}
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/opportunities"
              className="flex items-center justify-center gap-2 rounded-xl border border-black/10 px-6 py-3 text-sm font-semibold transition hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/5"
            >
              <Compass size={16} /> {i.browse}
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-3 gap-3">
            <StatChip icon={Users} value={userCount} label={i.activeUsers} />
            <StatChip icon={Briefcase} value={opportunityCount} label={i.opportunitiesStat} />
            <StatChip icon={Building2} value={organizationCount} label={i.organizationsStat} />
          </div>
        </div>

        {/* RIGHT — real featured opportunities, as a genuine slider */}
        {featured.length > 0 && (
          <div className="lg:col-span-3">
            <div className="mb-4 flex items-center justify-between">
              <p className="flex items-center gap-1.5 text-sm font-bold">
                <Sparkles size={15} className="text-purple-500" /> {f.title}
              </p>
              <div className="flex items-center gap-2">
                <Link href="/opportunities" className="text-xs font-medium text-purple-600 hover:underline dark:text-purple-400">
                  {f.seeAll}
                </Link>
                {totalSlides > 1 && (
                  <div className="flex gap-1">
                    <button
                      onClick={prev}
                      aria-label="Previous"
                      className="rounded-full border border-black/10 p-1.5 transition hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/10"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <button
                      onClick={next}
                      aria-label="Next"
                      className="rounded-full border border-purple-500 bg-purple-500 p-1.5 text-white transition hover:bg-purple-600"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {visible.map((offer, idx) => {
                const TypeIcon = TYPE_ICON[offer.type] ?? Award;
                const tone = TYPE_TONE[offer.type] ?? "bg-purple-600";
                const isUrgent = slide === 0 && idx === 0 && offer.daysLeft <= 5;
                return (
                  <Link
                    key={offer.id}
                    href={`/opportunities/${offer.id}`}
                    className="group animate-fade-in overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-white/10 dark:bg-white/5"
                  >
                    <div className="relative flex h-24 items-center justify-center overflow-hidden bg-gray-50 p-3 dark:bg-white/[0.03]">
                      <img src={offer.image} alt={`Logo ${offer.organization}`} className="h-full w-full object-contain" />
                      <span className={`absolute left-2.5 top-2.5 flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold text-white ${tone}`}>
                        <TypeIcon size={10} /> {typeLabels[offer.type as keyof typeof typeLabels]}
                      </span>
                      {isUrgent && (
                        <span className="absolute right-2.5 top-2.5 flex items-center gap-1 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-semibold text-white">
                          <Flame size={10} />
                        </span>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="mb-1 line-clamp-2 text-xs font-bold leading-snug">{offer.title}</p>
                      <p className="mb-2 truncate text-[11px] text-gray-500 dark:text-gray-400">{offer.organization}</p>
                      <p className="mb-2 flex items-center gap-1 text-[11px] text-gray-400">
                        <MapPin size={10} /> {offer.location}
                      </p>
                      <span className="inline-flex items-center gap-1 rounded-lg bg-purple-50 px-2 py-0.5 text-[11px] font-semibold text-purple-600 dark:bg-purple-500/10 dark:text-purple-300">
                        <Calendar size={10} /> {offer.deadline}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>

            {totalSlides > 1 && (
              <div className="mt-4 flex justify-center gap-1.5">
                {Array.from({ length: totalSlides }).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSlide(idx)}
                    aria-label={`Slide ${idx + 1}`}
                    className={`h-1.5 rounded-full transition-all ${
                      idx === slide ? "w-6 bg-purple-500" : "w-1.5 bg-black/10 dark:bg-white/15"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
