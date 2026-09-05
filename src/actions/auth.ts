"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { loginSchema } from "@/lib/validations/auth";

export type AuthFormState = {
  error?: string;
  success?: boolean;
};

export async function loginAction(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const rawIdentifier = formData.get("identifier");
  const rawPassword = formData.get("password");

  const validation = loginSchema.safeParse({
    identifier: typeof rawIdentifier === "string" ? rawIdentifier : "",
    password: typeof rawPassword === "string" ? rawPassword : "",
  });

  if (!validation.success) {
    const firstError = validation.error.issues[0]?.message || "Invalid credentials format.";
    return { error: firstError };
  }

  const { identifier: email, password } = validation.data;
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    if (error.message.toLowerCase().includes("invalid login credentials")) {
      return { error: "Incorrect email or password. Please try again." };
    }
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
