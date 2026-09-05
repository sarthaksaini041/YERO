import * as React from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-dvh flex flex-col bg-[var(--color-bg)]">
      {/* ── Desktop Fixed Sidebar ── */}
      <Sidebar />

      {/* ── Main Column ── */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-[var(--sidebar-width)]">
        {/* ── Page Content ── */}
        <div className="flex-1 flex flex-col min-h-0 pb-[env(safe-area-inset-bottom)]">
          {children}
        </div>
      </div>

      {/* ── Mobile Bottom Nav ── */}
      <BottomNav />
    </div>
  );
}
