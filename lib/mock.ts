// lib/mock.ts
// A single in-memory Book so the shell renders something real before Supabase.
// Replace with a Supabase fetch in step 9 — the shape does not change.

import type { Book, Doc } from "./types";
import { FUTURE_AREAS } from "./structure";
import { identitySeedContent, wordCountFromDoc } from "./seeds";

const now = () => new Date().toISOString();

/** Empty TipTap/ProseMirror doc. */
export const emptyDoc = (): Doc => ({
  content: { type: "doc", content: [{ type: "paragraph" }] },
  wordCount: 0,
  updatedAt: now(),
});

const identityDoc = (): Doc => {
  const content = identitySeedContent();
  return {
    content,
    wordCount: wordCountFromDoc(content),
    updatedAt: now(),
  };
};

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
    identity_now: identityDoc(),
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
