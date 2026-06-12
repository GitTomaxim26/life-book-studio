// lib/mock.ts
// A single in-memory Book so the shell renders something real before Supabase.
// Replace with a Supabase fetch in step 9 — the shape does not change.

import type { Book, Doc } from "./types";
import { FUTURE_AREAS } from "./structure";

const now = () => new Date().toISOString();

/** Empty TipTap/ProseMirror doc. */
export const emptyDoc = (): Doc => ({
  content: { type: "doc", content: [{ type: "paragraph" }] },
  wordCount: 0,
  updatedAt: now(),
});

/** A doc seeded with one paragraph of text (mock only). */
const seededDoc = (text: string): Doc => ({
  content: {
    type: "doc",
    content: [{ type: "paragraph", content: [{ type: "text", text }] }],
  },
  wordCount: text.trim().split(/\s+/).length,
  updatedAt: now(),
});

export const mockBook: Book = {
  id: "mock-book",
  theme: "night",
  cover: {
    title: "",
    subtitle: "",
    quote: "",
    begunAt: now(),
  },
  docs: {
    identity_now: seededDoc(
      "I am someone who notices the gap between what I admire and how I actually spend my days. The heroes I keep returning to are the patient ones — people who built something slowly and stayed."
    ),
    key_exp: emptyDoc(),
    new_identity: emptyDoc(),
    future_to_avoid: emptyDoc(),
    vision: emptyDoc(),
  },
  epochs: [
    { id: "e1", title: "Early childhood", text: "" },
    { id: "e2", title: "School years", text: "" },
  ],
  traits: {
    faults: { selected: [], order: [], notes: {} },
    virtues: { selected: [], order: [], notes: {} },
  },
  // Empty threads => New Identity stays locked, so you can see the gate working.
  threads: { repeats: [], insights: [], becoming: "" },
  futureAreas: FUTURE_AREAS.map((a) => ({
    id: a.id,
    group: a.group,
    title: a.title,
    hint: a.hint,
    doc: emptyDoc(),
  })),
  focusCycle: 1,
  focusAreaIds: [],
  focusHistory: [],
};
