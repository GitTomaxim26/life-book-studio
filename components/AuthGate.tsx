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
  saveTheme,
  saveCover,
  resetSection,
  discardBook as discardBookInStore,
  DiscardBookError,
  type SectionResetResult,
} from "@/lib/book-store";
import type { Book, ThreadsResult, Theme } from "@/lib/types";
import Login from "./Login";

type SaveFn = (
  slug: string,
  kind: string,
  content: unknown,
  wordCount: number
) => void;
type SaveThreadsFn = (threads: ThreadsResult) => void;
type SaveAreaFn = (slug: string, content: unknown, wordCount: number) => void;
type SaveThemeFn = (theme: Theme) => void;
type SaveCoverFn = (cover: Pick<Book["cover"], "title" | "subtitle" | "quote">) => void;
type ResetSectionFn = (slug: string) => Promise<SectionResetResult>;
type DiscardBookFn = (bookId: string) => Promise<void>;
type SaveStatus = "idle" | "saving" | "saved" | "error";
type Phase = "loading" | "out" | "in" | "load-error";

const SaveContext = createContext<SaveFn>(() => {});
const SaveThreadsContext = createContext<SaveThreadsFn>(() => {});
const SaveAreaContext = createContext<SaveAreaFn>(() => {});
const SaveThemeContext = createContext<SaveThemeFn>(() => {});
const SaveCoverContext = createContext<SaveCoverFn>(() => {});
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
/** Persist theme (books.theme). Immediate. */
export const useSaveTheme = () => useContext(SaveThemeContext);
/** Persist cover fields (books.title/subtitle/quote). Debounced. */
export const useSaveCover = () => useContext(SaveCoverContext);
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
  const [phase, setPhase] = useState<Phase>("loading");
  const [book, setBook] = useState<Book | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const pendingSaves = useRef<Map<string, () => Promise<void>>>(new Map());
  const flushPendingSavesRef = useRef<() => void>(() => {});
  const savedTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const sessionRef = useRef<Session | null>(null);

  const scheduleDebouncedSave = (key: string, run: () => Promise<void>) => {
    pendingSaves.current.set(key, run);
    clearTimeout(timers.current[key]);
    timers.current[key] = setTimeout(async () => {
      pendingSaves.current.delete(key);
      delete timers.current[key];
      try {
        await run();
        markSaved();
      } catch (e) {
        console.error("Save failed:", e);
        setSaveStatus("error");
      }
    }, 700);
  };

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
      sessionRef.current = null;
      setBook(null);
      setPhase("out");
      return;
    }
    sessionRef.current = session;
    setPhase("loading");
    try {
      const b = await loadOrCreateBook(supabase, session.user.id);
      setBook(b);
      setPhase("in");
    } catch (e) {
      console.error("Failed to load book:", e);
      setBook(null);
      setPhase("load-error");
    }
  }

  const markSaved = () => {
    setSaveStatus("saved");
    clearTimeout(savedTimer.current);
    savedTimer.current = setTimeout(() => setSaveStatus("idle"), 2000);
  };

  flushPendingSavesRef.current = () => {
    Object.keys(timers.current).forEach((k) => {
      clearTimeout(timers.current[k]);
      delete timers.current[k];
    });
    const pending = [...pendingSaves.current.values()];
    pendingSaves.current.clear();
    for (const run of pending) {
      void run().catch((e) => console.error("Flush save failed:", e));
    }
  };

  useEffect(() => {
    const flush = () => flushPendingSavesRef.current();
    const onVisibility = () => {
      if (document.visibilityState === "hidden") flush();
    };
    window.addEventListener("beforeunload", flush);
    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("beforeunload", flush);
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", onVisibility);
      flush();
    };
  }, []);

  // Debounced per-section save (prose).
  const save: SaveFn = (slug, kind, content, wordCount) => {
    if (!book) return;
    setSaveStatus("saving");
    scheduleDebouncedSave(`section:${slug}`, () =>
      saveSection(supabase, book.id, slug, kind, content, wordCount)
    );
  };

  // Debounced Threads save (structured).
  const saveThreadsFn: SaveThreadsFn = (threads) => {
    if (!book) return;
    setSaveStatus("saving");
    scheduleDebouncedSave("threads", () =>
      saveThreads(supabase, book.id, threads)
    );
  };

  // Debounced Future Area save (future_areas table).
  const saveAreaFn: SaveAreaFn = (slug, content, wordCount) => {
    if (!book) return;
    setSaveStatus("saving");
    scheduleDebouncedSave(`area:${slug}`, () =>
      saveArea(supabase, book.id, slug, content, wordCount)
    );
  };

  const saveThemeFn: SaveThemeFn = (theme) => {
    if (!book) return;
    setSaveStatus("saving");
    void saveTheme(supabase, book.id, theme)
      .then(() => markSaved())
      .catch((e) => {
        console.error("Theme save failed:", e);
        setSaveStatus("error");
      });
  };

  const saveCoverFn: SaveCoverFn = (cover) => {
    if (!book) return;
    setSaveStatus("saving");
    scheduleDebouncedSave("cover", () =>
      saveCover(supabase, book.id, cover)
    );
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
    pendingSaves.current.clear();
    setSaveStatus("saving");
    try {
      await discardBookInStore(supabase, session.user.id, bookId);
      window.location.reload();
    } catch (e) {
      if (e instanceof DiscardBookError && e.recovered) {
        window.location.reload();
        return;
      }
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
  if (phase === "load-error")
    return (
      <div className="auth-screen">
        <div className="auth-card">
          <p className="auth-quiet">Couldn&apos;t open your book.</p>
          <button
            type="button"
            className="auth-retry"
            onClick={() => handle(sessionRef.current)}
          >
            Retry
          </button>
        </div>
      </div>
    );
  if (phase === "out") return <Login />;
  if (!book) return null;

  return (
    <SaveContext.Provider value={save}>
      <SaveThreadsContext.Provider value={saveThreadsFn}>
        <SaveAreaContext.Provider value={saveAreaFn}>
          <SaveThemeContext.Provider value={saveThemeFn}>
            <SaveCoverContext.Provider value={saveCoverFn}>
              <ResetSectionContext.Provider value={resetSectionFn}>
                <DiscardBookContext.Provider value={discardBookFn}>
                  <SaveStatusContext.Provider value={saveStatus}>
                    {render(book)}
                  </SaveStatusContext.Provider>
                </DiscardBookContext.Provider>
              </ResetSectionContext.Provider>
            </SaveCoverContext.Provider>
          </SaveThemeContext.Provider>
        </SaveAreaContext.Provider>
      </SaveThreadsContext.Provider>
    </SaveContext.Provider>
  );
}
