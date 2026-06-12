// components/AuthGate.tsx
// The ONE place auth lives. Signed out -> Login. Signed in -> loads the book and
// renders the app, providing a debounced saveSection via context.
// To make the cover viewable before sign-in later, you change this file only.
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
import { loadOrCreateBook, saveSection } from "@/lib/book-store";
import type { Book } from "@/lib/types";
import Login from "./Login";

type SaveFn = (
  slug: string,
  kind: string,
  content: unknown,
  wordCount: number
) => void;

const SaveContext = createContext<SaveFn>(() => {});
/** Call this in a writing page to persist a section. Debounced + safe to call on every keystroke. */
export const useSaveSection = () => useContext(SaveContext);

export default function AuthGate({
  render,
}: {
  render: (book: Book) => ReactNode;
}) {
  const [phase, setPhase] = useState<"loading" | "out" | "in">("loading");
  const [book, setBook] = useState<Book | null>(null);
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

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

  // Debounced per-section save — IdentityPage can call this on every change.
  const save: SaveFn = (slug, kind, content, wordCount) => {
    if (!book) return;
    clearTimeout(timers.current[slug]);
    timers.current[slug] = setTimeout(() => {
      saveSection(supabase, book.id, slug, kind, content, wordCount).catch(
        (e) => console.error("Save failed:", e)
      );
    }, 700);
  };

  if (phase === "loading")
    return (
      <div className="auth-screen">
        <p className="auth-quiet">Opening your book…</p>
      </div>
    );
  if (phase === "out" || !book) return <Login />;

  return <SaveContext.Provider value={save}>{render(book)}</SaveContext.Provider>;
}
