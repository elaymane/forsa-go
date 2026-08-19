import type { Metadata } from "next";
import MarketingNav from "@/components/marketing/MarketingNav";
import MarketingFooter from "@/components/marketing/MarketingFooter";
import { getCurrentUser } from "@/lib/session";
import { getLocale } from "@/lib/i18n/getLocale";
import { MONTHLY_PRICE_MAD } from "@/lib/subscription";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms that govern your use of Forsa Go.",
  robots: { index: true, follow: true },
};

export const dynamic = "force-dynamic";

export default async function TermsPage() {
  const user = await getCurrentUser();
  const locale = await getLocale();

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#020617]">
      <MarketingNav loggedIn={Boolean(user)} locale={locale} />

      <section className="mx-auto max-w-2xl px-6 py-14 sm:px-10">
        <h1 className="font-display mb-2 text-3xl font-bold">Terms of Service</h1>
        <p className="mb-8 text-sm text-gray-500 dark:text-gray-400">Last updated: August 2026</p>

        <div className="space-y-8 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
          <div>
            <h2 className="mb-2 text-lg font-semibold text-black dark:text-white">What Forsa Go is</h2>
            <p>Forsa Go is a platform for discovering and tracking concours, jobs, internships, trainings, and scholarships in Morocco. We aggregate publicly available opportunity information and provide tools to help you track your own applications through them. We do not process applications on your behalf, and we are not affiliated with the organizations whose opportunities are listed unless stated otherwise.</p>
          </div>

          <div>
            <h2 className="mb-2 text-lg font-semibold text-black dark:text-white">Accuracy of listed opportunities</h2>
            <p>We make a genuine effort to keep opportunity details — deadlines, dates, requirements — accurate and current. However, we cannot guarantee this information is error-free or fully up to date. Always confirm deadlines and requirements directly with the organizing institution before relying on them.</p>
          </div>

          <div>
            <h2 className="mb-2 text-lg font-semibold text-black dark:text-white">Your account</h2>
            <p className="mb-2">You're responsible for keeping your password secure and for all activity under your account. You must provide accurate information when signing up.</p>
            <p>We reserve the right to suspend accounts used for spam, abuse, or attempts to disrupt the platform.</p>
          </div>

          <div>
            <h2 className="mb-2 text-lg font-semibold text-black dark:text-white">Subscriptions</h2>
            <p className="mb-2">Free accounts can track a limited number of opportunities. Premium removes this limit for {MONTHLY_PRICE_MAD} MAD per month.</p>
            <p className="mb-2">Subscription requests are reviewed manually against submitted payment details. We may decline a request if payment cannot be confirmed.</p>
            <p>Subscriptions are not automatically renewing at this time — each request covers one month.</p>
          </div>

          <div>
            <h2 className="mb-2 text-lg font-semibold text-black dark:text-white">Community submissions</h2>
            <p>If you submit an opportunity for others to see, you confirm the information is accurate to your knowledge. We review submissions before they become publicly visible and may edit or decline them.</p>
          </div>

          <div>
            <h2 className="mb-2 text-lg font-semibold text-black dark:text-white">Acceptable use</h2>
            <p>Don't use Forsa Go to scrape data at scale, attempt to access other users' accounts, upload harmful files, or misrepresent your identity when submitting a payment request.</p>
          </div>

          <div>
            <h2 className="mb-2 text-lg font-semibold text-black dark:text-white">Limitation of liability</h2>
            <p>Forsa Go is provided as-is. We're not liable for missed deadlines, application outcomes, or decisions made based on information listed on the platform. You remain responsible for verifying details directly with the relevant institution.</p>
          </div>

          <div>
            <h2 className="mb-2 text-lg font-semibold text-black dark:text-white">Changes to these terms</h2>
            <p>We may update these terms as the platform evolves. Continued use after a change means you accept the updated terms.</p>
          </div>

          <div>
            <h2 className="mb-2 text-lg font-semibold text-black dark:text-white">Contact</h2>
            <p>
              Questions about these terms? Message us on WhatsApp:{" "}
              <a href="https://wa.me/212643650571" className="text-purple-600 underline dark:text-purple-400">
                +212 643 650 571
              </a>
              .
            </p>
          </div>
        </div>
      </section>

      <MarketingFooter locale={locale} />
    </div>
  );
}
