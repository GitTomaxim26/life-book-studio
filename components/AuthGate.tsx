// components/AuthGate.tsx
// The ONE place auth lives. Signed out -> Login. Signed in -> loads the book and
// renders the app, providing: a debounced section save, a debounced Threads save,
// and a live save status.
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";
import {
  loadOrCreateBook,
  saveSection,
  saveThreads,
  saveArea,
  resetSection,
  discardBook as discardBookInStore,
  type SectionResetResult,
} from "@/lib/book-store";
import type { Book, ThreadsResult } from "@/lib/types";
import Login from "./Login";

type SaveFn = (
  slug: string,
  kind: string,
  content: unknown,
  wordCount: number
) => void;
type SaveThreadsFn = (threads: ThreadsResult) => void;
type SaveAreaFn = (slug: string, content: unknown, wordCount: number) => void;
type ResetSectionFn = (slug: string) => Promise<SectionResetResult>;
type DiscardBookFn = (bookId: string) => Promise<void>;
type SaveStatus = "idle" | "saving" | "saved" | "error";

const SaveContext = createContext<SaveFn>(() => {});
const SaveThreadsContext = createContext<SaveThreadsFn>(() => {});
const SaveAreaContext = createContext<SaveAreaFn>(() => {});
const ResetSectionContext = createContext<ResetSectionFn>(
  async () => {
    throw new Error("Reset not available");
  }
);
const DiscardBookContext = createContext<DiscardBookFn>(async () => {});
const SaveStatusContext = createContext<SaveStatus>("idle");

/** Persist a prose section. Debounced + safe to call on every keystroke. */
export const useSaveSection = () => useContext(SaveContext);
/** Persist the Threads structured section. Debounced. */
export const useSaveThreads = () => useContext(SaveThreadsContext);
/** Persist a Future Area doc (future_areas table). Debounced. */
export const useSaveArea = () => useContext(SaveAreaContext);
/** Reset the active section to its seed / empty state. Immediate. */
export const useResetSection = () => useContext(ResetSectionContext);
/** Permanently discard all book content and reload. Heavily guarded in UI. */
export const useDiscardBook = () => useContext(DiscardBookContext);
/** Live save state for a status indicator. */
export const useSaveStatus = () => useContext(SaveStatusContext);

export default function AuthGate({
  render,
}: {
  render: (book: Book) => ReactNode;
}) {
  const [phase, setPhase] = useState<"loading" | "out" | "in">("loading");
  const [book, setBook] = useState<Book | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const savedTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => handle(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) =>
      handle(session)
    );
    return () => sub.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handle(session: Session | null) {
    if (!session) {
      setBook(null);
      setPhase("out");
      return;
    }
    try {
      const b = await loadOrCreateBook(supabase, session.user.id);
      setBook(b);
      setPhase("in");
    } catch (e) {
      console.error("Failed to load book:", e);
      setPhase("out");
    }
  }

  const markSaved = () => {
    setSaveStatus("saved");
    clearTimeout(savedTimer.current);
    savedTimer.current = setTimeout(() => setSaveStatus("idle"), 2000);
  };

  // Debounced per-section save (prose).
  const save: SaveFn = (slug, kind, content, wordCount) => {
    if (!book) return;
    setSaveStatus("saving");
    clearTimeout(timers.current[slug]);
    timers.current[slug] = setTimeout(async () => {
      try {
        await saveSection(supabase, book.id, slug, kind, content, wordCount);
        markSaved();
      } catch (e) {
        console.error("Save failed:", e);
        setSaveStatus("error");
      }
    }, 700);
  };

  // Debounced Threads save (structured).
  const saveThreadsFn: SaveThreadsFn = (threads) => {
    if (!book) return;
    setSaveStatus("saving");
    clearTimeout(timers.current["threads"]);
    timers.current["threads"] = setTimeout(async () => {
      try {
        await saveThreads(supabase, book.id, threads);
        markSaved();
      } catch (e) {
        console.error("Save failed:", e);
        setSaveStatus("error");
      }
    }, 700);
  };

  // Debounced Future Area save (future_areas table).
  const saveAreaFn: SaveAreaFn = (slug, content, wordCount) => {
    if (!book) return;
    setSaveStatus("saving");
    clearTimeout(timers.current[slug]);
    timers.current[slug] = setTimeout(async () => {
      try {
        await saveArea(supabase, book.id, slug, content, wordCount);
        markSaved();
      } catch (e) {
        console.error("Save failed:", e);
        setSaveStatus("error");
      }
    }, 700);
  };

  const resetSectionFn: ResetSectionFn = async (slug) => {
    if (!book) throw new Error("No book loaded");
    clearTimeout(timers.current[slug]);
    if (slug === "threads") clearTimeout(timers.current["threads"]);
    setSaveStatus("saving");
    try {
      const result = await resetSection(supabase, book.id, slug);
      markSaved();
      return result;
    } catch (e) {
      console.error("Reset failed:", e);
      setSaveStatus("error");
      throw e;
    }
  };

  const discardBookFn: DiscardBookFn = async (bookId) => {
    if (!book || book.id !== bookId) throw new Error("Book mismatch");
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) throw new Error("Not signed in");

    Object.keys(timers.current).forEach((k) => clearTimeout(timers.current[k]));
    setSaveStatus("saving");
    try {
      await discardBookInStore(supabase, session.user.id, bookId);
      window.location.reload();
    } catch (e) {
      const message =
        e instanceof Error
          ? e.message
          : typeof e === "object" &&
              e !== null &&
              "message" in e &&
              typeof (e as { message: unknown }).message === "string"
            ? (e as { message: string }).message
            : "Discard failed";
      throw new Error(message, { cause: e });
    }
  };

  if (phase === "loading")
    return (
      <div className="auth-screen">
        <p className="auth-quiet">Opening your book…</p>
      </div>
    );
  if (phase === "out" || !book) return <Login />;

  return (
    <SaveContext.Provider value={save}>
      <SaveThreadsContext.Provider value={saveThreadsFn}>
        <SaveAreaContext.Provider value={saveAreaFn}>
          <ResetSectionContext.Provider value={resetSectionFn}>
            <DiscardBookContext.Provider value={discardBookFn}>
              <SaveStatusContext.Provider value={saveStatus}>
                {render(book)}
              </SaveStatusContext.Provider>
            </DiscardBookContext.Provider>
          </ResetSectionContext.Provider>
        </SaveAreaContext.Provider>
      </SaveThreadsContext.Provider>
    </SaveContext.Provider>
  );
}
