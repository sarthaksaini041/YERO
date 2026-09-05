import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getNotificationLogs } from "@/actions/notifications";
import { NotificationsContainer } from "@/components/notifications/NotificationsContainer";

export const metadata: Metadata = {
  title: "Notifications - YERO",
  description: "View your notification history.",
};

export default async function NotificationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: initialLogs } = await getNotificationLogs();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Header */}
      <header className="w-full bg-transparent sticky top-0 z-30 pt-3 pb-1">
        <div className="max-w-xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          {/* Back Navigation to Tasks */}
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full liquid-glass-card border border-white/90 shadow-2xs text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-white/95 active:scale-95 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Daily Tasks</span>
          </Link>

          {/* Dedicated liquid glass capsule for YERO branding */}
          <div className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-full liquid-glass-card border border-white/90 shadow-2xs">
            <Image
              src="/logo-sm.webp"
              alt="YERO Logo"
              width={20}
              height={20}
              className="w-5 h-5 rounded-md object-cover"
              priority
            />
            <span className="font-semibold text-slate-900 tracking-tight text-xs">
              YERO
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-4">
        <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">
          Notifications
        </h1>

        <NotificationsContainer initialLogs={initialLogs || []} />
      </main>

      <footer className="py-4 text-center text-[11px] text-slate-400 border-t border-slate-200/30">
        YERO &bull; Daily Tasks
      </footer>
    </div>
  );
}
