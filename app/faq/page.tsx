import type { Metadata } from "next";
import Script from "next/script";
import MarketingNav from "@/components/marketing/MarketingNav";
import MarketingFooter from "@/components/marketing/MarketingFooter";
import FaqAccordion from "@/components/marketing/FaqAccordion";
import { getCurrentUser } from "@/lib/session";
import { getLocale } from "@/lib/i18n/getLocale";
import { trackPageView } from "@/lib/analytics";
import { t } from "@/lib/i18n/translations";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const i = t(locale).faq;
  return {
    title: i.title,
    description: i.subtitle,
  };
}

export const dynamic = "force-dynamic";

export default async function FaqPage() {
  const user = await getCurrentUser();
  await trackPageView("/faq", user?.id ?? null);
  const locale = await getLocale();
  const i = t(locale).faq;
  const loggedIn = Boolean(user);

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: i.items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#020617]">
      <Script
        id="faq-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <MarketingNav loggedIn={loggedIn} locale={locale} />

      <section className="px-6 pb-10 pt-14 text-center sm:px-10">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-purple-500">{i.eyebrow}</p>
        <h1 className="font-display text-3xl font-bold sm:text-4xl">{i.title}</h1>
        <p className="mx-auto mt-3 max-w-xl text-gray-500 dark:text-gray-400">{i.subtitle}</p>
      </section>

      <section className="px-6 pb-20 sm:px-10">
        <div className="mx-auto max-w-3xl">
          <FaqAccordion items={i.items} />
        </div>
      </section>

      <MarketingFooter locale={locale} />
    </div>
  );
}
