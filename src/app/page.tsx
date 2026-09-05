import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getTasks } from "@/actions/tasks";
import { Header } from "@/components/dashboard/Header";
import { TaskList } from "@/components/tasks/TaskList";

import { getISTDetails } from "@/lib/time/ist";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: initialTasks } = await getTasks();

  const today = getISTDetails().formattedDisplay;



  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 max-w-xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <TaskList initialTasks={initialTasks} todayDate={today} />
      </main>

      <footer className="py-4 text-center text-[11px] text-slate-400 border-t border-slate-200/30">
        YERO &bull; Daily Tasks
      </footer>
    </div>
  );
}
