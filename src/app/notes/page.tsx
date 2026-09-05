import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getNotes } from "@/actions/notes";
import { NotesContainer } from "@/components/notes/NotesContainer";
import { AppShell } from "@/components/layout/app-shell";

export const metadata: Metadata = {
  title: "Notes - YERO",
  description: "Capture and manage personal notes, meeting briefs, and ideas.",
};

export default async function NotesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: initialNotes } = await getNotes(user.id);

  return (
    <AppShell maxWidth="xl">
      <NotesContainer initialNotes={initialNotes || []} />
    </AppShell>
  );
}
