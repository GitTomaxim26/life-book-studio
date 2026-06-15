// lib/book-store.ts
// Turns Supabase rows into the Book shape the app uses, and saves changes back.
// Prose chapters live in `sections.content`; structured sections (Threads) live in
// `sections.structured`. Future-area docs live in `future_areas`.

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Book, Doc, FutureArea, ThreadsResult, Theme, Cover } from "@/lib/types";
import { FUTURE_AREAS } from "@/lib/structure";
import {
  identitySeedContent,
  keyExperiencesSeedContent,
  newIdentitySeedContent,
  futureToAvoidSeedContent,
  visionSeedContent,
} from "@/lib/seeds";

const identitySeed = identitySeedContent();

const now = () => new Date().toISOString();
const emptyDoc = (): Doc => ({
  content: { type: "doc", content: [{ type: "paragraph" }] },
  wordCount: 0,
  updatedAt: now(),
});

// Part I–V prose sections keyed by slug.
const DOC_SLUGS = ["identity_now", "key_exp", "new_identity", "future_to_avoid", "vision"];

const emptyThreads = (): ThreadsResult => ({ repeats: [], insights: [], becoming: "" });

/** Coerce whatever is in the DB into a safe ThreadsResult (never trust shape blindly). */
function asThreads(structured: unknown): ThreadsResult {
  const t = (structured ?? {}) as Partial<ThreadsResult>;
  return {
    // `repeats` stays reserved for the future Muse — never authored or computed here.
    repeats: Array.isArray(t.repeats) ? t.repeats : [],
    insights: Array.isArray(t.insights) ? t.insights.filter((s) => typeof s === "string") : [],
    becoming: typeof t.becoming === "string" ? t.becoming : "",
  };
}

/** Honest word count of the AUTHORED threads text (insights + becoming). */
function threadsWordCount(t: ThreadsResult): number {
  const text = [...t.insights, t.becoming].join(" ").trim();
  return text ? text.split(/\s+/).length : 0;
}

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

  // 2) sections
  const { data: sectionRows } = await sb
    .from("sections")
    .select("*")
    .eq("book_id", bookRow.id);

  // 2a) prose docs (only the doc slugs — structured sections never enter docs)
  const docs: Record<string, Doc> = {};
  for (const slug of DOC_SLUGS) {
    docs[slug] =
      slug === "identity_now" && identitySeed
        ? { content: identitySeed, wordCount: 0, updatedAt: now() }
        : emptyDoc();
  }
  for (const r of sectionRows ?? []) {
    if (!DOC_SLUGS.includes(r.slug)) continue; // skip threads + any structured section
    docs[r.slug] = {
      content: r.content,
      wordCount: r.word_count ?? 0,
      updatedAt: r.updated_at ?? now(),
    };
  }

  // 2b) Threads (structured) — authored insights + becoming; repeats reserved for the Muse
  const threadsRow = (sectionRows ?? []).find((r: any) => r.slug === "threads");
  const threads: ThreadsResult = threadsRow ? asThreads(threadsRow.structured) : emptyThreads();

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
    threads,
    futureAreas,
    focusCycle: bookRow.focus_cycle ?? 1,
    focusAreaIds: [],
    focusHistory: [],
  };
}

/** Upsert a prose section (content). Works for Identity and every doc chapter. */
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

/** Upsert the Threads section into the `structured` column (NOT `content`). */
export async function saveThreads(
  sb: SupabaseClient,
  bookId: string,
  threads: ThreadsResult
): Promise<void> {
  const { error } = await sb.from("sections").upsert(
    {
      book_id: bookId,
      slug: "threads",
      kind: "threads",
      structured: threads,
      word_count: threadsWordCount(threads),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "book_id,slug" }
  );
  if (error) throw error;
}

/** Upsert a Future Area's doc into the `future_areas` table. */
export async function saveArea(
  sb: SupabaseClient,
  bookId: string,
  slug: string,
  content: unknown,
  wordCount: number
): Promise<void> {
  const area = FUTURE_AREAS.find((a) => a.id === slug);
  const { error } = await sb.from("future_areas").upsert(
    {
      book_id: bookId,
      slug,
      group_key: area?.group ?? null,
      content,
      word_count: wordCount,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "book_id,slug" }
  );
  if (error) throw error;
}

/** Persist cover theme (night / paper) on the user's books row. */
export async function saveTheme(
  sb: SupabaseClient,
  bookId: string,
  theme: Theme
): Promise<void> {
  const { error } = await sb
    .from("books")
    .update({ theme, updated_at: now() })
    .eq("id", bookId);
  if (error) throw error;
}

/** Persist cover fields on the user's books row. */
export async function saveCover(
  sb: SupabaseClient,
  bookId: string,
  cover: Pick<Cover, "title" | "subtitle" | "quote">
): Promise<void> {
  const { error } = await sb
    .from("books")
    .update({
      title: cover.title,
      subtitle: cover.subtitle,
      quote: cover.quote,
      updated_at: now(),
    })
    .eq("id", bookId);
  if (error) throw error;
}

/** Initial doc content for a prose section slug (seed scaffold or empty). */
function docSeedForSlug(slug: string): unknown {
  switch (slug) {
    case "identity_now":
      return identitySeedContent();
    case "key_exp":
      return keyExperiencesSeedContent();
    case "new_identity":
      return newIdentitySeedContent();
    case "future_to_avoid":
      return futureToAvoidSeedContent();
    case "vision":
      return visionSeedContent();
    default:
      return emptyDoc().content;
  }
}

export type SectionResetResult =
  | { kind: "doc"; slug: string; doc: Doc }
  | { kind: "threads"; threads: ThreadsResult }
  | { kind: "area"; slug: string; doc: Doc };

/** Apply a section reset result to in-memory Book state. */
export function applySectionReset(book: Book, result: SectionResetResult): Book {
  switch (result.kind) {
    case "doc":
      return {
        ...book,
        docs: { ...book.docs, [result.slug]: result.doc },
      };
    case "threads":
      return { ...book, threads: result.threads };
    case "area":
      return {
        ...book,
        futureAreas: book.futureAreas.map((a) =>
          a.id === result.slug ? { ...a, doc: result.doc } : a
        ),
      };
  }
}

/** Reset one section to its original seed / empty state. Scoped to bookId only. */
export async function resetSection(
  sb: SupabaseClient,
  bookId: string,
  slug: string
): Promise<SectionResetResult> {
  const ts = now();

  if (slug === "threads") {
    const threads = emptyThreads();
    await saveThreads(sb, bookId, threads);
    return { kind: "threads", threads };
  }

  if (FUTURE_AREAS.some((a) => a.id === slug)) {
    const content = emptyDoc().content;
    await saveArea(sb, bookId, slug, content, 0);
    return {
      kind: "area",
      slug,
      doc: { content, wordCount: 0, updatedAt: ts },
    };
  }

  if (DOC_SLUGS.includes(slug)) {
    const content = docSeedForSlug(slug);
    await saveSection(sb, bookId, slug, "doc", content, 0);
    return {
      kind: "doc",
      slug,
      doc: { content, wordCount: 0, updatedAt: ts },
    };
  }

  throw new Error(`Cannot reset unknown section: ${slug}`);
}

/** Thrown when discard fails; distinguishes untouched vs partial vs repaired. */
export class DiscardBookError extends Error {
  readonly contentErased: boolean;
  readonly recovered: boolean;

  constructor(
    message: string,
    opts: { contentErased: boolean; recovered: boolean; cause?: unknown }
  ) {
    super(message, { cause: opts.cause });
    this.name = "DiscardBookError";
    this.contentErased = opts.contentErased;
    this.recovered = opts.recovered;
  }
}

const FRESH_BOOK_ROW = {
  title: "",
  subtitle: "",
  quote: "",
  theme: "night" as const,
  focus_cycle: 1,
  begun_at: now(),
  updated_at: now(),
};

/** Idempotent repair: wipe child rows, reset books row, seed Identity. */
async function ensureFreshBookState(
  sb: SupabaseClient,
  userId: string,
  bookId: string
): Promise<void> {
  for (const table of ["sections", "future_areas", "cycles"] as const) {
    const { error } = await sb.from(table).delete().eq("book_id", bookId);
    if (error) throw error;
  }

  const { error: bookErr } = await sb
    .from("books")
    .update(FRESH_BOOK_ROW)
    .eq("id", bookId)
    .eq("user_id", userId);
  if (bookErr) throw bookErr;

  const { error: seedErr } = await sb.from("sections").upsert(
    {
      book_id: bookId,
      slug: "identity_now",
      kind: "doc",
      content: identitySeed,
      word_count: 0,
    },
    { onConflict: "book_id,slug" }
  );
  if (seedErr) throw seedErr;
}

/**
 * Permanently erase all book content for the signed-in user's book and re-seed
 * Identity. Scoped to bookId + userId; uses authenticated client only (RLS).
 * On failure after deletes begin, attempts repair so the book is usable again.
 */
export async function discardBook(
  sb: SupabaseClient,
  userId: string,
  bookId: string
): Promise<void> {
  const { data: owned, error: ownErr } = await sb
    .from("books")
    .select("id")
    .eq("id", bookId)
    .eq("user_id", userId)
    .maybeSingle();
  if (ownErr) throw ownErr;
  if (!owned) throw new Error("Book not found");

  let contentErased = false;
  try {
    const { error: secErr } = await sb
      .from("sections")
      .delete()
      .eq("book_id", bookId);
    if (secErr) throw secErr;
    contentErased = true;

    const { error: areaErr } = await sb
      .from("future_areas")
      .delete()
      .eq("book_id", bookId);
    if (areaErr) throw areaErr;

    const { error: cycleErr } = await sb
      .from("cycles")
      .delete()
      .eq("book_id", bookId);
    if (cycleErr) throw cycleErr;

    const { error: bookErr } = await sb
      .from("books")
      .update(FRESH_BOOK_ROW)
      .eq("id", bookId)
      .eq("user_id", userId);
    if (bookErr) throw bookErr;

    const { error: seedErr } = await sb.from("sections").insert({
      book_id: bookId,
      slug: "identity_now",
      kind: "doc",
      content: identitySeed,
      word_count: 0,
    });
    if (seedErr) throw seedErr;
  } catch (primaryErr) {
    if (!contentErased) throw primaryErr;

    try {
      await ensureFreshBookState(sb, userId, bookId);
      throw new DiscardBookError(
        "The reset did not finish cleanly, but your book was repaired to a fresh start. Reload the page to continue.",
        { contentErased: true, recovered: true, cause: primaryErr }
      );
    } catch (recoveryErr) {
      if (recoveryErr instanceof DiscardBookError) throw recoveryErr;
      throw new DiscardBookError(
        "Some of your book was erased before the reset could finish, and automatic repair failed. Reload and try discard again — if the book still looks broken, contact support.",
        { contentErased: true, recovered: false, cause: primaryErr }
      );
    }
  }
}
