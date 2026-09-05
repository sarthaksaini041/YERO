import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getTasks } from "@/actions/tasks";
import { TaskList } from "@/components/tasks/TaskList";
import { AppShell } from "@/components/layout/app-shell";
import { NotificationBootstrap } from "@/components/notifications/NotificationBootstrap";
import { getISTDetails } from "@/lib/time/ist";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: initialTasks } = await getTasks(user.id);
  const today = getISTDetails().formattedDisplay;

  return (
    <AppShell maxWidth="lg">
      {/* Auto-request notification permission on first load */}
      <NotificationBootstrap />
      <TaskList initialTasks={initialTasks} todayDate={today} />
    </AppShell>
  );
}
