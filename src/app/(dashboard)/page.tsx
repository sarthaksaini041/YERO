import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/server";
import { getTasks, getTotalCompletedTasksCount } from "@/actions/tasks";
import { TaskList } from "@/components/tasks/TaskList";
import { AppShell } from "@/components/layout/app-shell";
import { NotificationBootstrap } from "@/components/notifications/NotificationBootstrap";
import { getISTDetails } from "@/lib/time/ist";

export default async function HomePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: initialTasks }, totalCompletedAllTime] = await Promise.all([
    getTasks(user.id),
    getTotalCompletedTasksCount(user.id),
  ]);
  const today = getISTDetails().formattedDisplay;

  return (
    <AppShell>
      {/* Auto-request notification permission on first load */}
      <NotificationBootstrap />
      <TaskList
        initialTasks={initialTasks}
        todayDate={today}
        totalCompletedAllTime={totalCompletedAllTime}
      />
    </AppShell>
  );
}
