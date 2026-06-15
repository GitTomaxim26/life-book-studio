// components/Cover.tsx
"use client";

import type { Book } from "@/lib/types";
import { useSaveCover } from "@/components/AuthGate";

function editionLine(begunAt: string | null): string {
  const d = begunAt ? new Date(begunAt) : new Date();
  return (
    "First Edition · " +
    d.toLocaleDateString(undefined, { month: "long", year: "numeric" })
  );
}

export default function Cover({
  book,
  onChange,
  onOpen,
}: {
  book: Book;
  onChange: (b: Book) => void;
  onOpen: () => void;
}) {
  const c = book.cover;
  const saveCover = useSaveCover();

  const persistCover = (patch: Partial<typeof c>) => {
    const next = { ...c, ...patch };
    onChange({ ...book, cover: next });
    saveCover({
      title: next.title,
      subtitle: next.subtitle,
      quote: next.quote,
    });
  };

  return (
    <div className="center-view">
      <div className="center-scroll">
        <div className="cover-stage">
          <div className="cover">
            <div className="cover-eyebrow">A Full Life Book</div>
            <div className="cover-mark" aria-hidden>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
              </svg>
            </div>

            {/* Typeset, click-to-inscribe — uncontrolled to avoid caret jump */}
            <div
              className="cover-title"
              contentEditable
              suppressContentEditableWarning
              data-ph="My Full Life Book"
              onBlur={(e) =>
                persistCover({ title: e.currentTarget.textContent?.trim() ?? "" })
              }
            >
              {c.title}
            </div>

            <div className="cover-sub-row">
              <div
                className="cover-sub"
                contentEditable
                suppressContentEditableWarning
                data-ph="the theme of your whole book…"
                onBlur={(e) =>
                  persistCover({ subtitle: e.currentTarget.textContent?.trim() ?? "" })
                }
              >
                {c.subtitle}
              </div>
              <button className="cover-spark" title="Let the Muse name the theme" disabled>
                ✦
              </button>
            </div>

            <div className="cover-rule" />

            <div className="cover-quote-row">
              <div className={`cover-quote ${c.quote ? "" : "empty"}`}>
                {c.quote ? `“${c.quote}”` : "a line drawn from your own words…"}
              </div>
              <button className="cover-spark" title="Pull a line from your words" disabled>
                ✦
              </button>
            </div>

            <div className="cover-colophon">{editionLine(c.begunAt)}</div>
          </div>

          <div className="cover-actions">
            <button type="button" className="cover-begin" onClick={onOpen}>
              Open the book →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
