// lib/types.ts
// SINGLE SOURCE OF TRUTH.
// These types are the app state today and the Supabase schema shape tomorrow.
// When you build the DB (step 9), the tables mirror these — don't invent a second model.

export type Part = "I" | "II" | "III" | "turning" | "IV" | "V";

export type SectionKind =
  | "doc" // free prose: Identity Now, Key Experiences, New Identity, Future To Avoid
  | "epochs" // Life Epochs
  | "traits" // Faults / Virtues
  | "threads" // Threads of My Story (computed)
  | "area" // a Future area (doc-like, grouped + focusable)
  | "vision"; // Life Vision

export type FutureGroup =
  | "inner"
  | "body"
  | "work"
  | "relationships"
  | "lifestyle"
  | "purpose";

export type Theme = "night" | "paper";

/** ProseMirror/TipTap document JSON. Kept loose here; tighten once TipTap is in. */
export type DocJSON = unknown;

export interface Doc {
  content: DocJSON;
  wordCount: number;
  updatedAt: string; // ISO
}

export interface Cover {
  title: string;
  subtitle: string;
  quote: string;
  begunAt: string | null; // ISO; drives "First Edition · Month Year"
}

export interface Epoch {
  id: string;
  title: string;
  text: string;
}

export interface TraitSet {
  selected: string[]; // chosen words
  order: string[]; // ranked order of `selected`
  notes: Record<string, string>; // word -> the moment that proves it
}

export interface Traits {
  faults: TraitSet;
  virtues: TraitSet;
}

export interface ThreadRepeat {
  word: string;
  count: number;
}

export interface ThreadsResult {
  repeats: ThreadRepeat[];
  insights: string[]; // length > 0 UNLOCKS New Identity (the gate)
  becoming: string;
}

export interface FutureArea {
  id: string; // e.g. "f_health"
  group: FutureGroup;
  title: string;
  hint?: string;
  doc: Doc;
}

export type CycleStatus = "active" | "complete";

export interface Cycle {
  number: number;
  chosenAreaIds: string[]; // <= 3
  status: CycleStatus;
  startedAt: string;
  completedAt?: string;
}

export interface Book {
  id: string;
  cover: Cover;
  theme: Theme;

  /** Part I–V prose, keyed by slug: identity_now, key_exp, new_identity, future_to_avoid, vision */
  docs: Record<string, Doc>;

  epochs: Epoch[];
  traits: Traits;
  threads: ThreadsResult;

  futureAreas: FutureArea[]; // exactly 16
  focusCycle: number;
  focusAreaIds: string[]; // current cycle's chosen rooms (<= 3)
  focusHistory: Cycle[];
}

// ---- Muse (AI) ----
// Mode is chosen by which section is active. The proxy (step 10) maps mode -> system prompt.
export type MuseMode =
  | "helper" // Identity
  | "questioner" // Past
  | "mirror" // Present
  | "synthesizer" // Threads
  | "coauthor" // Future
  | "weaver" // Life Vision
  | "editor"; // review passes

export interface MuseMessage {
  id: string;
  role: "user" | "muse";
  content: string;
  createdAt: string;
}

// ---- Gate helpers (the core thesis, enforced in one place) ----
export const threadsWoven = (b: Book): boolean => b.threads.insights.length > 0;
export const newIdentityWritten = (b: Book): boolean =>
  (b.docs["new_identity"]?.wordCount ?? 0) > 0;
/** Future areas + Future To Avoid unlock only after New Identity is written. */
export const futureUnlocked = (b: Book): boolean => newIdentityWritten(b);
