"use client";

import { useState } from "react";
import type { Book } from "@/lib/types";
import { useDiscardBook } from "@/components/AuthGate";
import { DiscardBookError } from "@/lib/book-store";

const CONFIRM_WORD = "DISCARD";

export default function BookSettingsPage({ book }: { book: Book }) {
  const runDiscardBook = useDiscardBook();
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canConfirm = typed === CONFIRM_WORD && !busy;

  const handleDiscard = async () => {
    if (!canConfirm) return;
    setBusy(true);
    setError(null);
    try {
      await runDiscardBook(book.id);
    } catch (e) {
      console.error("Discard failed:", e);
      if (e instanceof DiscardBookError) {
        setError(e.message);
        setBusy(false);
        return;
      }
      const detail =
        e instanceof Error
          ? e.message
          : typeof e === "object" &&
              e !== null &&
              "message" in e
            ? String((e as { message: unknown }).message)
            : String(e);
      setError(
        detail
          ? `Something went wrong before your book was changed: ${detail}`
          : "Something went wrong before your book was changed."
      );
      setBusy(false);
    }
  };

  const closeModal = () => {
    if (busy) return;
    setOpen(false);
    setTyped("");
    setError(null);
  };

  return (
    <div className="center-view">
      <div className="center-scroll">
        <div className="book-settings center-inner">
      <div className="book-settings-inner">
        <h1 className="book-settings-title">Book settings</h1>
        <p className="book-settings-lede">
          Quiet account-level actions for your Life Book.
        </p>

        <section className="book-settings-section">
          <h2 className="book-settings-h">Appearance</h2>
          <p className="book-settings-note">
            Theme is available from the Muse panel — Linen or Velvet edition.
          </p>
        </section>

        <section className="book-settings-section book-settings-danger">
          <h2 className="book-settings-h">Start over completely</h2>
          <p className="book-settings-note">
            For test or junk content only. This removes everything you have
            written and begins again with a clean book — the same as a first visit.
          </p>
          <button
            type="button"
            className="book-settings-discard-btn"
            onClick={() => setOpen(true)}
          >
            Discard test book and start clean
          </button>
        </section>
      </div>

      {open && (
        <div
          className="book-modal-backdrop"
          role="presentation"
          onClick={closeModal}
        >
          <div
            className="book-modal book-modal--danger"
            role="dialog"
            aria-labelledby="discard-book-title"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="discard-book-title" className="book-modal-title">
              Discard this book?
            </h2>
            <p className="book-modal-body">
              This will permanently erase this book — every chapter, thread, and
              future area — and start you with a clean one. Use this only for
              test or junk content. This cannot be undone.
            </p>
            <label className="book-modal-label" htmlFor="discard-confirm">
              Type <strong>{CONFIRM_WORD}</strong> to confirm
            </label>
            <input
              id="discard-confirm"
              className="book-modal-input"
              type="text"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              autoComplete="off"
              spellCheck={false}
              disabled={busy}
            />
            {error && <p className="book-modal-error">{error}</p>}
            <div className="book-modal-actions">
              <button
                type="button"
                className="book-modal-btn book-modal-btn--ghost"
                onClick={closeModal}
                disabled={busy}
              >
                Cancel
              </button>
              <button
                type="button"
                className="book-modal-btn book-modal-btn--danger"
                onClick={handleDiscard}
                disabled={!canConfirm}
              >
                {busy ? "Discarding…" : "Discard book"}
              </button>
            </div>
          </div>
        </div>
      )}
        </div>
      </div>
    </div>
  );
}
