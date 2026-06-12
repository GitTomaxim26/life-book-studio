// lib/book-store.ts
// Turns Supabase rows into the Book shape the app already uses, and saves changes back.
// Step 5 wires Identity end-to-end; the same saveSection works for every doc section later.

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Book, Doc, FutureArea } from "@/lib/types";
import { FUTURE_AREAS } from "@/lib/structure";
import * as seeds from "@/lib/seeds";

// Find the Identity seed regardless of how lib/seeds.ts exports it.
const identitySeed: unknown = (() => {
  const s: any = seeds;
  if (typeof s.identitySeedContent === "function") return s.identitySeedContent();
  return (
    s.identitySeed ??
    s.IDENTITY_SEED ??
    s.identityScaffold ??
    s.default ??
    null
  );
})();

const now = () => new Date().toISOString();
const emptyDoc = (): Doc => ({
  content: { type: "doc", content: [{ type: "paragraph" }] },
  wordCount: 0,
  updatedAt: now(),
});

// Part I–V prose sections keyed by slug.
const DOC_SLUGS = ["identity_now", "key_exp", "new_identity", "future_to_avoid", "vision"];

/** Load the signed-in user's book, creating it (and seeding Identity) on first visit. */
export async function loadOrCreateBook(
  sb: SupabaseClient,
  userId: string
): Promise<Book> {
  // 1) books row (one per user)
  let { data: bookRow } = await sb
    .from("books")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (!bookRow) {
    const { data: created, error } = await sb
      .from("books")
      .insert({ user_id: userId })
      .select()
      .single();
    if (error) throw error;
    bookRow = created;

    // Seed Identity so a brand-new book opens as a chapter, not a blank page.
    await sb.from("sections").insert({
      book_id: bookRow.id,
      slug: "identity_now",
      kind: "doc",
      content: identitySeed,
      word_count: 0,
    });
  }

  // 2) sections → docs map
  const { data: sectionRows } = await sb
    .from("sections")
    .select("*")
    .eq("book_id", bookRow.id);

  const docs: Record<string, Doc> = {};
  for (const slug of DOC_SLUGS) {
    docs[slug] =
      slug === "identity_now" && identitySeed
        ? { content: identitySeed, wordCount: 0, updatedAt: now() }
        : emptyDoc();
  }
  for (const r of sectionRows ?? []) {
    docs[r.slug] = {
      content: r.content,
      wordCount: r.word_count ?? 0,
      updatedAt: r.updated_at ?? now(),
    };
  }

  // 3) future areas (16) — overlay any saved rows onto the fixed config
  const { data: areaRows } = await sb
    .from("future_areas")
    .select("*")
    .eq("book_id", bookRow.id);
  const areaMap = new Map((areaRows ?? []).map((r: any) => [r.slug, r]));
  const futureAreas: FutureArea[] = FUTURE_AREAS.map((a) => {
    const r: any = areaMap.get(a.id);
    return {
      id: a.id,
      group: a.group,
      title: a.title,
      hint: a.hint,
      doc: r
        ? { content: r.content, wordCount: r.word_count ?? 0, updatedAt: r.updated_at ?? now() }
        : emptyDoc(),
    };
  });

  // 4) assemble the Book the UI expects
  return {
    id: bookRow.id,
    cover: {
      title: bookRow.title ?? "",
      subtitle: bookRow.subtitle ?? "",
      quote: bookRow.quote ?? "",
      begunAt: bookRow.begun_at ?? now(),
    },
    theme: bookRow.theme ?? "night",
    docs,
    epochs: [],
    traits: {
      faults: { selected: [], order: [], notes: {} },
      virtues: { selected: [], order: [], notes: {} },
    },
    threads: { repeats: [], insights: [], becoming: "" },
    futureAreas,
    focusCycle: bookRow.focus_cycle ?? 1,
    focusAreaIds: [],
    focusHistory: [],
  };
}

/** Upsert a prose section. Same call works for Identity now and every doc section later. */
export async function saveSection(
  sb: SupabaseClient,
  bookId: string,
  slug: string,
  kind: string,
  content: unknown,
  wordCount: number
): Promise<void> {
  const { error } = await sb.from("sections").upsert(
    {
      book_id: bookId,
      slug,
      kind,
      content,
      word_count: wordCount,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "book_id,slug" }
  );
  if (error) throw error;
}
