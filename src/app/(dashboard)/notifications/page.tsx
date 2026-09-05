import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/server";
import { getNotificationLogs } from "@/actions/notifications";
import { NotificationsContainer } from "@/components/notifications/NotificationsContainer";
import { AppShell } from "@/components/layout/app-shell";

export const metadata: Metadata = {
  title: "Notifications - YERO",
  description: "View your notification history and system alerts.",
};

export default async function NotificationsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const { data: initialLogs } = await getNotificationLogs(user.id);

  return (
    <AppShell maxWidth="lg">
      <div className="space-y-3.5 sm:space-y-4">
        <h1 className="text-heading-lg">Notifications</h1>
        <NotificationsContainer initialLogs={initialLogs || []} />
      </div>
    </AppShell>
  );
}
