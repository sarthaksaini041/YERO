import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/server";
import { getConnectors } from "@/actions/connectors";
import { ConnectorsContainer } from "@/components/connectors/ConnectorsContainer";
import { AppShell } from "@/components/layout/app-shell";

export const metadata: Metadata = {
  title: "Connectors - YERO",
  description: "Connect your competitive programming accounts to sync your stats.",
};

export default async function ConnectorsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const { data: connectors } = await getConnectors();

  return (
    <AppShell maxWidth="md">
      <ConnectorsContainer initialConnectors={connectors} />
    </AppShell>
  );
}
