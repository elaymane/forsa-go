import type { Metadata } from "next";
import MarketingNav from "@/components/marketing/MarketingNav";
import MarketingFooter from "@/components/marketing/MarketingFooter";
import { getCurrentUser } from "@/lib/session";
import { getLocale } from "@/lib/i18n/getLocale";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Forsa Go collects, uses, and protects your data.",
  robots: { index: true, follow: true },
};

export const dynamic = "force-dynamic";

export default async function PrivacyPage() {
  const user = await getCurrentUser();
  const locale = await getLocale();

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#020617]">
      <MarketingNav loggedIn={Boolean(user)} locale={locale} />

      <section className="mx-auto max-w-2xl px-6 py-14 sm:px-10">
        <h1 className="font-display mb-2 text-3xl font-bold">Privacy Policy</h1>
        <p className="mb-8 text-sm text-gray-500 dark:text-gray-400">Last updated: August 2026</p>

        <div className="space-y-8 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
          <div>
            <h2 className="mb-2 text-lg font-semibold text-black dark:text-white">What we collect</h2>
            <p className="mb-2">When you create an account, we collect your name, email address, and password (stored securely, never in plain text).</p>
            <p className="mb-2">Optionally, to help match you with relevant opportunities, you may provide your education level, field of study, and location.</p>
            <p>If you track an opportunity, we store which one, its stage in your application pipeline (applied, written exam, oral exam, accepted), and any personal exam dates you add.</p>
          </div>

          <div>
            <h2 className="mb-2 text-lg font-semibold text-black dark:text-white">Subscription payments</h2>
            <p>If you request a Premium subscription, we ask for the first and last name the bank transfer was made under, so we can match your payment. You may optionally upload a photo of your receipt to help us confirm faster. Once your request is reviewed — approved or declined — that receipt image is permanently deleted from our storage.</p>
          </div>

          <div>
            <h2 className="mb-2 text-lg font-semibold text-black dark:text-white">Cookies we use</h2>
            <ul className="list-disc space-y-1 pl-5">
              <li><strong>forsa_session</strong> — keeps you logged in. Expires after 30 days or when you log out.</li>
              <li><strong>forsa_locale</strong> — remembers whether you prefer English or French.</li>
              <li><strong>forsa_visitor</strong> — an anonymous identifier used only to count visits for our own analytics, not to track you across other sites.</li>
            </ul>
            <p className="mt-2">We do not use third-party advertising or tracking cookies.</p>
          </div>

          <div>
            <h2 className="mb-2 text-lg font-semibold text-black dark:text-white">Who can see your data</h2>
            <p className="mb-2">Your name, education level, and location are never shown publicly to other users. Your saved and tracked opportunities are private to you.</p>
            <p>Forsa Go administrators can see your account details and subscription status to provide support and process subscription requests.</p>
          </div>

          <div>
            <h2 className="mb-2 text-lg font-semibold text-black dark:text-white">Where your data is stored</h2>
            <p>Your account data is stored in a managed PostgreSQL database (Neon). Uploaded files, such as payment receipts and organization logos, are stored via Vercel Blob. Both providers process data on our behalf and do not use it for their own purposes.</p>
          </div>

          <div>
            <h2 className="mb-2 text-lg font-semibold text-black dark:text-white">Your rights</h2>
            <p>You can update your profile information at any time from your account settings. To request deletion of your account and associated data, contact us using the details below.</p>
          </div>

          <div>
            <h2 className="mb-2 text-lg font-semibold text-black dark:text-white">Contact</h2>
            <p>
              Questions about this policy? Message us on WhatsApp:{" "}
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
