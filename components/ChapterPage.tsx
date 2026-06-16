"use client";

// components/ChapterPage.tsx
// One reusable writing chapter. Same autosave path as IdentityPage, parameterized.
// Title + eyebrow come from structure.ts (single source of truth); the registry
// (lib/chapters.ts) supplies only the lede and the seed scaffold.

import { useState } from "react";
import type { Book, DocJSON } from "@/lib/types";
import { useSaveSection } from "@/components/AuthGate";
import { leafInfo } from "@/lib/structure";
import Editor from "./Editor";
import ResetChapterButton from "./ResetChapterButton";

export default function ChapterPage({
  book,
  onChange,
  slug,
  lede,
  seed,
}: {
  book: Book;
  onChange: (b: Book) => void;
  slug: string;
  lede: string;
  seed?: DocJSON;
}) {
  const doc = book.docs[slug];
  const save = useSaveSection();
  const info = leafInfo(slug);
  const [editorRev, setEditorRev] = useState(0);

  const update = (content: DocJSON, wordCount: number) => {
    onChange({
      ...book,
      docs: {
        ...book.docs,
        [slug]: { content, wordCount, updatedAt: new Date().toISOString() },
      },
    });
    // Persist to Supabase (AuthGate debounces ~700ms). Same path Identity uses.
    save(slug, "doc", content, wordCount);
  };

  return (
    <Editor
      key={`${slug}-${editorRev}`}
      showToolbar
      value={doc?.content}
      seed={seed}
      onChange={update}
      header={
        <div className="doc-head">
          <div className="doc-head-eb">{info?.partLabel ?? "Your book"}</div>
          <h1 className="doc-head-title">{info?.title ?? "Chapter"}</h1>
          <p className="doc-head-lede">{lede}</p>
          <ResetChapterButton
            slug={slug}
            book={book}
            onChange={onChange}
            onResetComplete={() => setEditorRev((r) => r + 1)}
          />
        </div>
      }
    />
  );
}
