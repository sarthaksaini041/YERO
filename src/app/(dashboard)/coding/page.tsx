import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getCurrentUser } from "@/lib/supabase/server";
import { getConnectors } from "@/actions/connectors";
import { CodingDashboard } from "@/components/coding/CodingDashboard";
import { CodingSkeleton } from "@/components/coding/CodingSkeleton";
import { AppShell } from "@/components/layout/app-shell";

export const metadata: Metadata = {
  title: "Competitive Programming - YERO",
  description:
    "Aggregated competitive programming analytics, problem breakdowns, and contest progression across connected platforms.",
};

export default async function CodingPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const { data: connectors } = await getConnectors();
  const cpConnectors = (connectors || []).filter((c) => c.platform !== "github");

  return (
    <AppShell>
      <Suspense fallback={<CodingSkeleton />}>
        <CodingDashboard initialConnectors={cpConnectors} />
      </Suspense>
    </AppShell>
  );
}
