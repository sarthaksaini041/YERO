import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/server";
import { getConnectors } from "@/actions/connectors";
import { SettingsContainer } from "@/components/settings/SettingsContainer";
import { AppShell } from "@/components/layout/app-shell";

export const metadata: Metadata = {
  title: "Settings - YERO",
  description: "Manage your YERO account settings and platform connectors.",
};

export default async function SettingsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const { data: connectors } = await getConnectors();

  return (
    <AppShell>
      <SettingsContainer initialConnectors={connectors} />
    </AppShell>
  );
}
