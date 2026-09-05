import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/server";
import { getNotes } from "@/actions/notes";
import { NotesContainer } from "@/components/notes/NotesContainer";
import { AppShell } from "@/components/layout/app-shell";

export const metadata: Metadata = {
  title: "Notes - YERO",
  description: "Capture and manage personal notes, meeting briefs, and ideas.",
};

export default async function NotesPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const { data: initialNotes } = await getNotes(user.id);

  return (
    <AppShell>
      <NotesContainer initialNotes={initialNotes || []} />
    </AppShell>
  );
}
