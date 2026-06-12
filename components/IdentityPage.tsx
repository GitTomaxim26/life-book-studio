// components/IdentityPage.tsx
"use client";

import type { Book, DocJSON } from "@/lib/types";
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
    // STEP 9: debounce this and persist to Supabase here.
  };

  return (
    <div>
      <div className="page-eyebrow">Part I · Identity</div>
      <h2 className="page-title">Identity (Now)</h2>
      <p className="muse-note" style={{ marginBottom: 18 }}>
        The lens the whole book is written through. Who are you, honestly, today —
        your heroes, your anti-heroes, what you value, what you believe?
      </p>
      <Editor
        value={doc.content}
        placeholder="I am someone who…"
        onChange={update}
      />
    </div>
  );
}
