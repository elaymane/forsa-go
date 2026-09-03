import Link from "next/link";
import { ArrowRight, Crown } from "lucide-react";
import { FOUNDING_MEMBER_CAP, FOUNDING_MEMBER_FREE_MONTHS } from "@/lib/subscription";
import { t, type Locale } from "@/lib/i18n/translations";

function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? ""));
}

export default function FinalCTA({ loggedIn, spotsLeft, locale }: { loggedIn: boolean; spotsLeft: number; locale: Locale }) {
  const i = t(locale).finalCta;

  return (
    <section className="px-6 pb-20 sm:px-10">
      <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 to-amber-500 shadow-2xl">
        <div className="flex flex-col items-center gap-8 p-10 sm:flex-row sm:justify-between sm:p-12">
          <div className="text-center sm:text-left">
            <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
              {i.titleLine1}
              <br />
              {i.titleLine2}
            </h2>
            <p className="mt-2 text-sm text-white/85">{i.subtitle}</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href={loggedIn ? "/dashboard" : "/signup"}
                className="flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-orange-600 transition hover:scale-[1.02]"
              >
                {loggedIn ? i.goToDashboard : i.createAccount} <ArrowRight size={16} />
              </Link>
              <Link
                href="/opportunities"
                className="flex items-center justify-center gap-2 rounded-xl border border-white/40 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                {i.browse}
              </Link>
            </div>
          </div>

          {spotsLeft > 0 && (
            <div className="w-full max-w-xs shrink-0 rounded-2xl bg-white/15 p-5 backdrop-blur-xl">
              <div className="mb-2 flex items-center gap-2 text-white">
                <Crown size={18} />
                <p className="font-semibold">{i.foundingTitle}</p>
              </div>
              <p className="text-sm text-white/85">
                {fill(i.foundingSubtitle, { cap: FOUNDING_MEMBER_CAP, months: FOUNDING_MEMBER_FREE_MONTHS })}
              </p>
              <p className="mt-3 text-lg font-bold text-white">
                {spotsLeft}/{FOUNDING_MEMBER_CAP} <span className="text-sm font-normal text-white/70">{i.spotsLeft}</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
