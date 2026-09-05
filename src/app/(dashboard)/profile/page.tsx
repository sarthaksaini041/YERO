import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/server";
import { ProfileContainer } from "@/components/profile/ProfileContainer";
import { AppShell } from "@/components/layout/app-shell";

export const metadata: Metadata = {
  title: "Profile - YERO",
  description: "Manage your personal profile and account credentials.",
};

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const name =
    (user.user_metadata?.name as string) ||
    (user.user_metadata?.full_name as string) ||
    user.email?.split("@")[0] ||
    "User";

  const profileData = {
    name,
    email: user.email || "",
  };

  return (
    <AppShell>
      <ProfileContainer initialData={profileData} />
    </AppShell>
  );
}
