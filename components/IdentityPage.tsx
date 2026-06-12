"use client";

import type { Book, DocJSON } from "@/lib/types";
import { identitySeedContent } from "@/lib/seeds";
import Editor from "./Editor";

export default function IdentityPage({
  book,
  onChange,
}: {
  book: Book;
  onChange: (b: Book) => void;
}) {
  const doc = book.docs["identity_now"];

  const update = (content: DocJSON, wordCount: number) => {
    onChange({
      ...book,
      docs: {
        ...book.docs,
        identity_now: { content, wordCount, updatedAt: new Date().toISOString() },
      },
    });
  };

  return (
    <Editor
      showToolbar
      value={doc.content}
      seed={identitySeedContent()}
      onChange={update}
      header={
        <div className="doc-head">
          <div className="doc-head-eb">Part I · Identity</div>
          <h1 className="doc-head-title">Identity (Now)</h1>
          <p className="doc-head-lede">Who is holding the pen?</p>
        </div>
      }
    />
  );
}
