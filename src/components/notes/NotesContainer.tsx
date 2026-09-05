"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import type { Note } from "@/db/schema";
import { NoteCard } from "./NoteCard";
import {
  createNote,
  updateNote,
  deleteNote,
  togglePinNote,
} from "@/actions/notes";
import { Tabs } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icon } from "@/components/ui/icon";
import {
  Add01Icon,
  Search01Icon,
  StickyNote01Icon,
} from "@hugeicons/core-free-icons";

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

  if (initialNotes !== prevInitialNotes) {
    setPrevInitialNotes(initialNotes);
    setNotes(initialNotes);
  }

  const [searchQuery, setSearchQuery] = React.useState("");
  const [tab, setTab] = React.useState<TabKey>("all");
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedNote, setSelectedNote] = React.useState<Note | null>(null);

  // Filter notes
  const filteredNotes = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return notes.filter((n) => {
      // Tab filter
      if (tab === "pinned" && !n.pinned) return false;

      // Search query filter
      if (q) {
        const titleMatch = n.title.toLowerCase().includes(q);
        const contentMatch = n.content.toLowerCase().includes(q);
        return titleMatch || contentMatch;
      }

      return true;
    });
  }, [notes, tab, searchQuery]);

  const pinnedCount = React.useMemo(() => notes.filter((n) => n.pinned).length, [notes]);
  const totalCount = notes.length;

  // Handlers
  const handleOpenCreate = React.useCallback(() => {
    setSelectedNote(null);
    setIsModalOpen(true);
  }, []);

  const handleOpenEdit = React.useCallback((note: Note) => {
    setSelectedNote(note);
    setIsModalOpen(true);
  }, []);

  const handleSave = async (data: {
    id?: string;
    title: string;
    content: string;
    pinned: boolean;
  }) => {
    if (data.id) {
      // Edit existing note
      const original = [...notes];
      setNotes((prev) =>
        prev.map((n) =>
          n.id === data.id
            ? {
                ...n,
                title: data.title,
                content: data.content,
                pinned: data.pinned,
                updatedAt: new Date(),
              }
            : n
        )
      );

      const res = await updateNote({
        id: data.id,
        title: data.title,
        content: data.content,
        pinned: data.pinned,
      });

      if (!res.success) {
        setNotes(original);
        alert(res.error || "Failed to update note.");
      } else if (res.note) {
        setNotes((prev) =>
          prev.map((n) => (n.id === data.id ? res.note! : n))
        );
      }
    } else {
      // Create new note
      const tempId = crypto.randomUUID();
      const optimisticNote: Note = {
        id: tempId,
        userId: "optimistic",
        title: data.title,
        content: data.content,
        color: "default",
        pinned: data.pinned,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setNotes((prev) => [optimisticNote, ...prev]);

      const res = await createNote({
        title: data.title,
        content: data.content,
        pinned: data.pinned,
      });

      if (res.success && res.note) {
        setNotes((prev) =>
          prev.map((n) => (n.id === tempId ? res.note! : n))
        );
      } else {
        setNotes((prev) => prev.filter((n) => n.id !== tempId));
        alert(res.error || "Failed to create note.");
      }
    }
  };

  const handleDelete = async (id: string) => {
    const original = [...notes];
    setNotes((prev) => prev.filter((n) => n.id !== id));
    const res = await deleteNote(id);
    if (!res.success) {
      setNotes(original);
      alert(res.error || "Failed to delete note.");
    }
  };

  const handleTogglePin = async (id: string, pinned: boolean) => {
    const original = [...notes];
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, pinned, updatedAt: new Date() } : n))
    );

    const res = await togglePinNote(id, pinned);
    if (!res.success) {
      setNotes(original);
      alert(res.error || "Failed to toggle pin.");
    }
  };

  return (
    <div className="space-y-3.5 sm:space-y-4">
      {/* ── Page Header ── */}
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-heading-lg">Notes</h1>

        <Button
          type="button"
          onClick={handleOpenCreate}
          size="sm"
          className="shrink-0"
        >
          <Icon icon={Add01Icon} size="sm" />
          <span>New Note</span>
        </Button>
      </div>

      {/* ── Controls: Search & Tabs ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        {/* Filter Tabs */}
        <Tabs
          tabs={[
            { key: "all", label: "All", count: totalCount },
            { key: "pinned", label: "Pinned", count: pinnedCount },
          ] as const}
          activeKey={tab}
          onChange={(k) => setTab(k as TabKey)}
          layoutId="notesTabFilter"
          size="sm"
          fullWidth
          className="w-full sm:w-auto"
        />

        {/* Search input */}
        <div className="relative w-full sm:w-60 shrink-0">
          <Icon
            icon={Search01Icon}
            size="sm"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-faint)] pointer-events-none"
          />
          <Input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8.5 h-9 text-[12.5px]"
          />
        </div>
      </div>

      {/* ── Notes Grid ── */}
      <div>
        {filteredNotes.length > 0 ? (
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2.5 sm:gap-3"
          >
            <AnimatePresence>
              {filteredNotes.map((note) => (
                <motion.div
                  key={note.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.18 }}
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
              searchQuery.trim()
                ? "No matching notes"
                : tab === "pinned"
                ? "No pinned notes"
                : "No notes yet"
            }
            description={
              searchQuery.trim()
                ? `No notes match "${searchQuery}".`
                : tab === "pinned"
                ? "Pin important notes to keep them at the top."
                : "Create a note to capture ideas, checklists, or references."
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
      </div>

      {/* ── Editor Modal (Lazy Loaded) ── */}
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
