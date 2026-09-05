"use server";

import { revalidatePath } from "next/cache";
import { createClient, getCurrentUser } from "@/lib/supabase/server";
import {
  createTaskSchema,
  updateTaskStatusSchema,
  deleteTaskSchema,
} from "@/lib/validations/task";
import type { Task } from "@/db/schema";

export async function getTasks(providedUserId?: string): Promise<{ data: Task[]; error?: string }> {
  let userId = providedUserId;

  if (!userId) {
    const user = await getCurrentUser();
    if (!user) {
      return { data: [], error: "Unauthorized" };
    }
    userId = user.id;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tasks")
    .select("id, user_id, title, completed, created_at, updated_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    return { data: [], error: error.message };
  }

  const mappedTasks: Task[] = (data || []).map((t) => ({
    id: t.id,
    userId: t.user_id,
    title: t.title,
    completed: t.completed,
    createdAt: new Date(t.created_at),
    updatedAt: new Date(t.updated_at),
  }));

  return { data: mappedTasks };
}

export async function createTask(
  title: string
): Promise<{ success: boolean; task?: Task; error?: string }> {
  const validation = createTaskSchema.safeParse({ title });
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0]?.message || "Invalid task title.",
    };
  }

  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "Please log in to add tasks." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tasks")
    .insert({
      user_id: user.id,
      title: validation.data.title,
      completed: false,
    })
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/");
  return {
    success: true,
    task: {
      id: data.id,
      userId: data.user_id,
      title: data.title,
      completed: data.completed,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    },
  };
}

export async function toggleTask(
  id: string,
  completed: boolean
): Promise<{ success: boolean; error?: string }> {
  const validation = updateTaskStatusSchema.safeParse({ id, completed });
  if (!validation.success) {
    return { success: false, error: "Invalid task update." };
  }

  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("tasks")
    .update({
      completed: validation.data.completed,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/");
  return { success: true };
}

export async function deleteTask(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const validation = deleteTaskSchema.safeParse({ id });
  if (!validation.success) {
    return { success: false, error: "Invalid task ID." };
  }

  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/");
  return { success: true };
}
