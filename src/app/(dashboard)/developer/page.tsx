import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getCurrentUser } from "@/lib/supabase/server";
import { getConnectors } from "@/actions/connectors";
import { DeveloperDashboard } from "@/components/developer/DeveloperDashboard";
import { DeveloperSkeleton } from "@/components/developer/DeveloperSkeleton";
import { AppShell } from "@/components/layout/app-shell";

export const metadata: Metadata = {
  title: "Developer Intelligence - YERO",
  description:
    "Real GitHub developer metrics, 52-week contribution heatmaps, commit activity, repositories, stars, and open-source progress.",
};

export default async function DeveloperPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const { data: connectors } = await getConnectors();
  const githubConnector = connectors?.find((c) => c.platform === "github") || null;

  return (
    <AppShell>
      <Suspense fallback={<DeveloperSkeleton />}>
        <DeveloperDashboard initialConnector={githubConnector} />
      </Suspense>
    </AppShell>
  );
}
