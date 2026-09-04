import { Check, Crown, Users } from "lucide-react";
import { FREE_TRACK_LIMIT, FREE_CONCOURS_ADD_LIMIT, MONTHLY_PRICE_MAD, FOUNDING_MEMBER_CAP, FOUNDING_MEMBER_FREE_MONTHS } from "@/lib/subscription";
import { MANAGER_TIER_PRICES_MAD, MANAGER_TIER_LIMITS, MANAGER_TIER_LABELS, type ManagerTier } from "@/lib/managerTiers";
import type { Locale } from "@/lib/i18n/translations";

const MANAGER_TIER_ORDER: ManagerTier[] = ["basic", "pro", "unlimited"];

function PlanCard({
  icon,
  name,
  price,
  suffix,
  features,
  highlighted,
  badge,
}: {
  icon: React.ReactNode;
  name: string;
  price: string;
  suffix?: string;
  features: string[];
  highlighted?: boolean;
  badge?: string;
}) {
  return (
    <div
      className={`rounded-3xl border p-6 ${
        highlighted
          ? "border-purple-400 bg-white shadow-lg dark:border-purple-500/40 dark:bg-white/5"
          : "border-black/10 bg-white/60 dark:border-white/10 dark:bg-white/[0.02]"
      }`}
    >
      {badge && (
        <span className="mb-3 inline-block rounded-full bg-purple-500 px-2.5 py-0.5 text-xs font-semibold text-white">
          {badge}
        </span>
      )}
      <div className="mb-1 flex items-center gap-1.5">
        {icon}
        <h3 className="font-bold">{name}</h3>
      </div>
      <p className="mb-4">
        <span className="text-2xl font-bold">{price}</span>
        {suffix && <span className="text-sm text-gray-500 dark:text-gray-400"> {suffix}</span>}
      </p>
      <div className="space-y-2">
        {features.map((feature) => (
          <div key={feature} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
            <Check size={16} className="mt-0.5 shrink-0 text-emerald-500" />
            <span>{feature}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PricingSummary({ locale }: { locale: Locale }) {
  const fr = locale === "fr";

  return (
    <section id="pricing" className="px-6 py-16 sm:px-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-3 text-center">
          <h2 className="font-display text-2xl font-bold sm:text-3xl">{fr ? "Tarifs" : "Pricing"}</h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
            {fr
              ? "Pour vous-même, ou pour suivre plusieurs personnes à la fois — un coach, un centre d'orientation, ou un parent gérant plusieurs concours."
              : "For yourself, or for tracking several people at once — a coach, an orientation counselor, or a parent managing several concours."}
          </p>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <PlanCard
            icon={<Crown size={16} className="text-amber-500" />}
            name={fr ? "Gratuit" : "Free"}
            price={fr ? "0 MAD" : "0 MAD"}
            features={[
              fr
                ? `Suivez jusqu'à ${FREE_TRACK_LIMIT} opportunités`
                : `Track up to ${FREE_TRACK_LIMIT} opportunities`,
              fr ? `Ajoutez jusqu'à ${FREE_CONCOURS_ADD_LIMIT} concours` : `Add up to ${FREE_CONCOURS_ADD_LIMIT} concours`,
            ]}
          />
          <PlanCard
            icon={<Crown size={16} className="text-amber-500" />}
            name="Premium"
            price={`${MONTHLY_PRICE_MAD} MAD`}
            suffix={fr ? "/mois" : "/mo"}
            highlighted
            badge={
              fr
                ? `1ers 100 : ${FOUNDING_MEMBER_FREE_MONTHS} mois gratuits`
                : `First ${FOUNDING_MEMBER_CAP}: ${FOUNDING_MEMBER_FREE_MONTHS} months free`
            }
            features={[fr ? "Suivi illimité" : "Unlimited tracking", fr ? "Concours illimités" : "Unlimited concours"]}
          />
        </div>

        <div className="mb-4 flex items-center gap-2">
          <Users size={16} className="text-purple-500" />
          <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
            {fr ? "Pour suivre d'autres comptes" : "For tracking on behalf of others"}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {MANAGER_TIER_ORDER.map((tier) => {
            const limit = MANAGER_TIER_LIMITS[tier];
            return (
              <PlanCard
                key={tier}
                icon={<Users size={16} className="text-purple-500" />}
                name={MANAGER_TIER_LABELS[tier]}
                price={`${MANAGER_TIER_PRICES_MAD[tier]} MAD`}
                suffix={fr ? "/mois" : "/mo"}
                highlighted={tier === "pro"}
                badge={tier === "pro" ? (fr ? "Populaire" : "Popular") : undefined}
                features={[
                  limit === null
                    ? fr
                      ? "Comptes liés illimités"
                      : "Unlimited linked accounts"
                    : fr
                    ? `Jusqu'à ${limit} comptes liés`
                    : `Up to ${limit} linked accounts`,
                  fr
                    ? "Suivi et candidatures illimités pour chaque compte"
                    : "Unlimited tracking and applying for every account",
                ]}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
