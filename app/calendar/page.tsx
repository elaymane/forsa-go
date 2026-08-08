import { redirect } from "next/navigation";
import type { Metadata } from "next";
import AppShell from "@/components/layout/AppShell";
import CalendarView, { type CalendarEvent } from "@/components/calendar/CalendarView";
import { getOpportunities } from "@/lib/db/opportunities";
import { getApplicationsMap, generateDeadlineRemindersInBackground } from "@/lib/db/applications";
import { getNotifications } from "@/lib/db/notifications";
import { getCurrentUser, getActingUser } from "@/lib/session";
import ActingAsBanner from "@/components/manager/ActingAsBanner";
import { isAdminEmail } from "@/lib/admin";
import { getLocale } from "@/lib/i18n/getLocale";

export const metadata: Metadata = {
  title: "Calendar",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function CalendarPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/calendar");
  const actingUser = await getActingUser(user);

  generateDeadlineRemindersInBackground(actingUser.id);

  const [opportunities, applicationsMap, notifications, locale] = await Promise.all([
    getOpportunities(actingUser.id),
    getApplicationsMap(actingUser.id),
    getNotifications(user.id),
    getLocale(),
  ]);

  // Every date relevant to something the user has saved or applied to —
  // written exam, oral exam, and application deadline, official or self-added.
  const events: CalendarEvent[] = [];
  for (const offer of opportunities) {
    const state = applicationsMap[offer.id];
    if (!state) continue;

    const writtenDate = offer.examDate ?? state.userExamDate;
    const oralDate = offer.oralExamDate ?? state.userOralExamDate;

    if (writtenDate) {
      events.push({ date: writtenDate, offerId: offer.id, title: offer.title, organization: offer.organization, kind: "written" });
    }
    if (oralDate) {
      events.push({ date: oralDate, offerId: offer.id, title: offer.title, organization: offer.organization, kind: "oral" });
    }
    if (offer.deadlineDate) {
      events.push({
        date: offer.deadlineDate,
        offerId: offer.id,
        title: offer.title,
        organization: offer.organization,
        kind: "deadline",
      });
    }
  }

  return (
    <AppShell
      title="Your Calendar"
      subtitle="Every written exam, oral exam and deadline for what you're tracking"
      notifications={notifications}
      user={user}
      isAdmin={isAdminEmail(user.email)}
      locale={locale}
    >
      {actingUser.id !== user.id && <ActingAsBanner name={actingUser.name} />}
      <CalendarView events={events} opportunities={opportunities} applicationsMap={applicationsMap} />
    </AppShell>
  );
}
