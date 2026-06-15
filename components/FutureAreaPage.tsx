"use client";

// components/FutureAreaPage.tsx
// A Future Area — a room to design from the new identity, not a transformation gate.
// Header: group eyebrow + title + framing paragraph (why this room matters) + hint +
// a soft starter line. The editor itself opens clean (no generic placeholder).
// Autosaves to the future_areas table.

import type { Book, DocJSON } from "@/lib/types";
import { GROUPS, FUTURE_AREAS } from "@/lib/structure";
import { useSaveArea } from "@/components/AuthGate";
import Editor from "./Editor";
import ResetChapterButton from "./ResetChapterButton";

export default function FutureAreaPage({
  book,
  onChange,
  slug,
}: {
  book: Book;
  onChange: (b: Book) => void;
  slug: string;
}) {
  const idx = book.futureAreas.findIndex((a) => a.id === slug);
  const area = book.futureAreas[idx];
  const def = FUTURE_AREAS.find((a) => a.id === slug);
  const save = useSaveArea();

  if (!area) {
    return (
      <div className="center-inner">
        <div className="chapter-blank">
          <h2 className="chapter-blank-title">This area isn’t available.</h2>
        </div>
      </div>
    );
  }

  const groupLabel =
    GROUPS.find((g) => g.id === area.group)?.label ?? "Part IV · Future";

  const update = (content: DocJSON, wordCount: number) => {
    const next = book.futureAreas.slice();
    next[idx] = {
      ...area,
      doc: { content, wordCount, updatedAt: new Date().toISOString() },
    };
    onChange({ ...book, futureAreas: next });
    save(slug, content, wordCount);
  };

  return (
    <Editor
      key={area.doc.updatedAt}
      showToolbar
      value={area.doc.content}
      onChange={update}
      placeholder=" "
      header={
        <div className="doc-head">
          <div className="doc-head-eb">{groupLabel}</div>
          <h1 className="doc-head-title">{area.title}</h1>
          {def?.frame && <p className="area-frame">{def.frame}</p>}
          {area.hint && <p className="doc-head-hint">{area.hint}</p>}
          <ResetChapterButton slug={slug} book={book} onChange={onChange} />
        </div>
      }
    />
  );
}
