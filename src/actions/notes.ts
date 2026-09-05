"use server";

import { revalidatePath } from "next/cache";
import { createClient, getCurrentUser } from "@/lib/supabase/server";
import {
  createNoteSchema,
  updateNoteSchema,
  togglePinNoteSchema,
  deleteNoteSchema,
} from "@/lib/validations/note";
import type { Note } from "@/db/schema";

export async function getNotes(providedUserId?: string): Promise<{ data: Note[]; error?: string }> {
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
    .from("notes")
    .select("id, user_id, title, content, color, pinned, created_at, updated_at")
    .eq("user_id", userId)
    .order("pinned", { ascending: false })
    .order("updated_at", { ascending: false });

  if (error) {
    return { data: [], error: error.message };
  }

  const mappedNotes: Note[] = (data || []).map((n) => ({
    id: n.id,
    userId: n.user_id,
    title: n.title,
    content: n.content || "",
    color: n.color || "default",
    pinned: n.pinned ?? false,
    createdAt: new Date(n.created_at),
    updatedAt: new Date(n.updated_at),
  }));

  return { data: mappedNotes };
}

export async function createNote(input: {
  title: string;
  content?: string;
  color?: string;
  pinned?: boolean;
}): Promise<{ success: boolean; note?: Note; error?: string }> {
  const validation = createNoteSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0]?.message || "Invalid note data.",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Please log in to create notes." };
  }

  const { data, error } = await supabase
    .from("notes")
    .insert({
      user_id: user.id,
      title: validation.data.title,
      content: validation.data.content,
      color: validation.data.color,
      pinned: validation.data.pinned,
    })
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/notes");
  return {
    success: true,
    note: {
      id: data.id,
      userId: data.user_id,
      title: data.title,
      content: data.content || "",
      color: data.color || "default",
      pinned: data.pinned ?? false,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    },
  };
}

export async function updateNote(input: {
  id: string;
  title: string;
  content?: string;
  color?: string;
  pinned?: boolean;
}): Promise<{ success: boolean; note?: Note; error?: string }> {
  const validation = updateNoteSchema.safeParse(input);
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0]?.message || "Invalid note update.",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Unauthorized" };
  }

  const updatePayload: Record<string, unknown> = {
    title: validation.data.title,
    content: validation.data.content,
    color: validation.data.color,
    updated_at: new Date().toISOString(),
  };

  if (validation.data.pinned !== undefined) {
    updatePayload.pinned = validation.data.pinned;
  }

  const { data, error } = await supabase
    .from("notes")
    .update(updatePayload)
    .eq("id", validation.data.id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/notes");
  return {
    success: true,
    note: {
      id: data.id,
      userId: data.user_id,
      title: data.title,
      content: data.content || "",
      color: data.color || "default",
      pinned: data.pinned ?? false,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    },
  };
}

export async function togglePinNote(
  id: string,
  pinned: boolean
): Promise<{ success: boolean; error?: string }> {
  const validation = togglePinNoteSchema.safeParse({ id, pinned });
  if (!validation.success) {
    return { success: false, error: "Invalid parameters." };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Unauthorized" };
  }

  const { error } = await supabase
    .from("notes")
    .update({
      pinned: validation.data.pinned,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/notes");
  return { success: true };
}

export async function deleteNote(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const validation = deleteNoteSchema.safeParse({ id });
  if (!validation.success) {
    return { success: false, error: "Invalid note ID." };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Unauthorized" };
  }

  const { error } = await supabase
    .from("notes")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/notes");
  return { success: true };
}
