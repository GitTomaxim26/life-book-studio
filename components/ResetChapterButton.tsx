"use client";

import { useState } from "react";
import type { Book } from "@/lib/types";
import { applySectionReset } from "@/lib/book-store";
import { useResetSection } from "@/components/AuthGate";

export default function ResetChapterButton({
  slug,
  book,
  onChange,
}: {
  slug: string;
  book: Book;
  onChange: (b: Book) => void;
}) {
  const resetSection = useResetSection();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleConfirm = async () => {
    setBusy(true);
    try {
      const result = await resetSection(slug);
      onChange(applySectionReset(book, result));
      setOpen(false);
    } catch (e) {
      console.error("Reset failed:", e);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        type="button"
        className="reset-chapter-btn"
        onClick={() => setOpen(true)}
      >
        Reset this chapter
      </button>

      {open && (
        <div
          className="book-modal-backdrop"
          role="presentation"
          onClick={() => !busy && setOpen(false)}
        >
          <div
            className="book-modal"
            role="dialog"
            aria-labelledby="reset-chapter-title"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="reset-chapter-title" className="book-modal-title">
              Reset this chapter?
            </h2>
            <p className="book-modal-body">
              Your writing here will be replaced with the original starting
              prompts. The rest of your book is untouched.
            </p>
            <div className="book-modal-actions">
              <button
                type="button"
                className="book-modal-btn book-modal-btn--ghost"
                onClick={() => setOpen(false)}
                disabled={busy}
              >
                Cancel
              </button>
              <button
                type="button"
                className="book-modal-btn book-modal-btn--confirm"
                onClick={handleConfirm}
                disabled={busy}
              >
                {busy ? "Resetting…" : "Reset"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
