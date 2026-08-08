import MarketingNav from "@/components/marketing/MarketingNav";
import Hero from "@/components/marketing/Hero";
import TrustedByOrgs from "@/components/marketing/TrustedByOrgs";
import Features from "@/components/marketing/Features";
import JourneySteps from "@/components/marketing/JourneySteps";
import ProductShowcase from "@/components/marketing/ProductShowcase";
import ScreenshotsSection from "@/components/marketing/ScreenshotsSection";
import VideoSection from "@/components/marketing/VideoSection";
import WhyChooseUs from "@/components/marketing/WhyChooseUs";
import PricingSummary from "@/components/marketing/PricingSummary";
import StatsBar from "@/components/marketing/StatsBar";
import FinalCTA from "@/components/marketing/FinalCTA";
import MarketingFooter from "@/components/marketing/MarketingFooter";
import { getCurrentUser } from "@/lib/session";
import { getUserCount, getFoundingMemberSpotsLeft } from "@/lib/db/auth";
import { getOpportunities } from "@/lib/db/opportunities";
import { trackPageView } from "@/lib/analytics";
import { summarizeOrganizations } from "@/lib/organizations";
import { getLocale } from "@/lib/i18n/getLocale";

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  const user = await getCurrentUser();
  await trackPageView("/", user?.id ?? null);
  const loggedIn = Boolean(user);
  const locale = await getLocale();

  const [userCount, opportunities, spotsLeft] = await Promise.all([
    getUserCount(),
    getOpportunities(),
    getFoundingMemberSpotsLeft(),
  ]);
  const organizations = summarizeOrganizations(opportunities);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#020617]">
      <MarketingNav loggedIn={loggedIn} locale={locale} />
      <Hero
        loggedIn={loggedIn}
        userCount={userCount}
        opportunityCount={opportunities.length}
        organizationCount={organizations.length}
        locale={locale}
      />
      <TrustedByOrgs organizations={organizations} locale={locale} />
      <Features locale={locale} />
      <JourneySteps locale={locale} />
      <ScreenshotsSection locale={locale} />
      <ProductShowcase locale={locale} />
      <VideoSection locale={locale} />

      <div className="pb-16">
        <StatsBar
          userCount={userCount}
          opportunityCount={opportunities.length}
          organizationCount={organizations.length}
          locale={locale}
        />
      </div>

      <WhyChooseUs locale={locale} />
      <PricingSummary locale={locale} />
      <FinalCTA loggedIn={loggedIn} spotsLeft={spotsLeft} locale={locale} />
      <MarketingFooter locale={locale} />
    </div>
  );
}
