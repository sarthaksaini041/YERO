"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import type { Note } from "@/db/schema";
import { NoteCard } from "./NoteCard";
import { createNote, updateNote, deleteNote, togglePinNote } from "@/actions/notes";
import { Tabs } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icon } from "@/components/ui/icon";
import { Add01Icon, Search01Icon, StickyNote01Icon } from "@hugeicons/core-free-icons";

const NoteEditorModal = dynamic(
  () => import("./NoteEditorModal").then((mod) => mod.NoteEditorModal),
  { ssr: false }
);

interface NotesContainerProps {
  initialNotes: Note[];
}

type TabKey = "all" | "pinned";

export function NotesContainer({ initialNotes }: NotesContainerProps) {
  const [notes, setNotes] = React.useState<Note[]>(initialNotes);
  const [prevInitialNotes, setPrevInitialNotes] = React.useState<Note[]>(initialNotes);
  if (initialNotes !== prevInitialNotes) { setPrevInitialNotes(initialNotes); setNotes(initialNotes); }

  const [searchQuery, setSearchQuery] = React.useState("");
  const [tab, setTab] = React.useState<TabKey>("all");
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedNote, setSelectedNote] = React.useState<Note | null>(null);

  const filteredNotes = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return notes.filter((n) => {
      if (tab === "pinned" && !n.pinned) return false;
      if (q) return n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q);
      return true;
    });
  }, [notes, tab, searchQuery]);

  const pinnedCount = React.useMemo(() => notes.filter((n) => n.pinned).length, [notes]);
  const totalCount = notes.length;

  const handleOpenCreate = React.useCallback(() => { setSelectedNote(null); setIsModalOpen(true); }, []);
  const handleOpenEdit = React.useCallback((note: Note) => { setSelectedNote(note); setIsModalOpen(true); }, []);

  const handleSave = async (data: { id?: string; title: string; content: string; pinned: boolean }) => {
    if (data.id) {
      const original = [...notes];
      setNotes((prev) => prev.map((n) => n.id === data.id
        ? { ...n, title: data.title, content: data.content, pinned: data.pinned, updatedAt: new Date() } : n));
      const res = await updateNote({ id: data.id, title: data.title, content: data.content, pinned: data.pinned });
      if (!res.success) { setNotes(original); alert(res.error || "Failed to update note."); }
      else if (res.note) setNotes((prev) => prev.map((n) => (n.id === data.id ? res.note! : n)));
    } else {
      const tempId = crypto.randomUUID();
      const optimisticNote: Note = {
        id: tempId, userId: "optimistic", title: data.title, content: data.content,
        color: "default", pinned: data.pinned, createdAt: new Date(), updatedAt: new Date(),
      };
      setNotes((prev) => [optimisticNote, ...prev]);
      const res = await createNote({ title: data.title, content: data.content, pinned: data.pinned });
      if (res.success && res.note) setNotes((prev) => prev.map((n) => (n.id === tempId ? res.note! : n)));
      else { setNotes((prev) => prev.filter((n) => n.id !== tempId)); alert(res.error || "Failed to create note."); }
    }
  };

  const handleDelete = async (id: string) => {
    const original = [...notes];
    setNotes((prev) => prev.filter((n) => n.id !== id));
    const res = await deleteNote(id);
    if (!res.success) { setNotes(original); alert(res.error || "Failed to delete note."); }
  };

  const handleTogglePin = async (id: string, pinned: boolean) => {
    const original = [...notes];
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, pinned, updatedAt: new Date() } : n)));
    const res = await togglePinNote(id, pinned);
    if (!res.success) { setNotes(original); alert(res.error || "Failed to toggle pin."); }
  };

  return (
    <div className="space-y-5">
      {/* ── Page Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-heading-xl">Notes</h1>
        </div>
        <Button type="button" onClick={handleOpenCreate} size="md" className="shrink-0">
          <Icon icon={Add01Icon} size="sm" />
          <span>New Note</span>
        </Button>
      </div>

      {/* ── Controls: Tabs + Search on same row ── */}
      <div className="flex items-center gap-3 flex-wrap">
        <Tabs
          tabs={[
            { key: "all",    label: "All",    count: totalCount },
            { key: "pinned", label: "Pinned", count: pinnedCount },
          ] as const}
          activeKey={tab}
          onChange={(k) => setTab(k as TabKey)}
          layoutId="notesTabFilter"
          size="sm"
        />

        {/* Search — grows to fill remaining space up to a sensible cap */}
        <div className="relative flex-1 min-w-[160px] max-w-[320px]">
          <Icon
            icon={Search01Icon}
            size="sm"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-faint)] pointer-events-none"
          />
          <Input
            type="text"
            placeholder="Search notes…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-[13px]"
          />
        </div>
      </div>

      {/* ── Notes Grid ──
          Responsive column count:
          - 1 col on mobile
          - 2 cols on sm (≥640px)
          - 3 cols on lg (≥1024px)
          - 4 cols on 2xl (≥1536px) for very wide screens
      ── */}
      {filteredNotes.length > 0 ? (
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3"
        >
          <AnimatePresence>
            {filteredNotes.map((note) => (
              <motion.div
                key={note.id}
                layout
                initial={{ opacity: 0, scale: 0.97, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              >
                <NoteCard
                  note={note}
                  onEdit={handleOpenEdit}
                  onDelete={handleDelete}
                  onTogglePin={handleTogglePin}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <EmptyState
          icon={<Icon icon={StickyNote01Icon} size="lg" />}
          title={
            searchQuery.trim() ? "No matching notes" :
            tab === "pinned"   ? "No pinned notes" :
                                 "No notes yet"
          }
          description={
            searchQuery.trim()
              ? `No notes match "${searchQuery}".`
              : tab === "pinned"
              ? "Pin important notes to keep them at the top."
              : "Create your first note to capture ideas, checklists, or references."
          }
          action={
            !searchQuery.trim() && tab === "all" ? (
              <Button type="button" onClick={handleOpenCreate} size="sm">
                <Icon icon={Add01Icon} size="xs" />
                <span>Create Note</span>
              </Button>
            ) : undefined
          }
        />
      )}

      {/* ── Editor Modal ── */}
      {isModalOpen && (
        <NoteEditorModal
          isOpen={isModalOpen}
          noteToEdit={selectedNote}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
