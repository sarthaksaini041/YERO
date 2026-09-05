"use server";

import { revalidatePath } from "next/cache";
import { createClient, getCurrentUser } from "@/lib/supabase/server";

export interface ProfileData {
  name: string;
  email: string;
}

export async function getProfileData(): Promise<{
  data?: ProfileData;
  error?: string;
}> {
  const user = await getCurrentUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const name =
    (user.user_metadata?.name as string) ||
    (user.user_metadata?.full_name as string) ||
    user.email?.split("@")[0] ||
    "User";

  return {
    data: {
      name,
      email: user.email || "",
    },
  };
}

export async function updateProfileName(
  name: string
): Promise<{ success: boolean; error?: string }> {
  const trimmed = name.trim();
  if (!trimmed || trimmed.length < 2) {
    return { success: false, error: "Name must be at least 2 characters." };
  }

  if (trimmed.length > 50) {
    return { success: false, error: "Name cannot exceed 50 characters." };
  }

  const user = await getCurrentUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    data: {
      name: trimmed,
      full_name: trimmed,
    },
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/profile");
  return { success: true };
}

export async function updatePassword(
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  if (!newPassword || newPassword.length < 6) {
    return {
      success: false,
      error: "New password must be at least 6 characters.",
    };
  }

  const user = await getCurrentUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
