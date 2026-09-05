import * as React from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { Header } from "@/components/layout/Header";

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
    <div className="min-h-screen flex flex-col bg-[var(--color-bg)]">
      {/* ── Desktop Fixed Sidebar (Persistent across navigations) ── */}
      <Sidebar />

      {/* ── Main Content Area ── */}
      <div className="flex-1 flex flex-col min-w-0 transition-[padding] duration-200 lg:pl-64 pb-20 sm:pb-22 lg:pb-8">
        {/* ── Desktop Header Context (Persistent) ── */}
        <Header />

        {children}
      </div>

      {/* ── Mobile Floating Bottom Navigation Bar (Persistent across navigations) ── */}
      <BottomNav />
    </div>
  );
}
