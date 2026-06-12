// components/Sidebar.tsx
"use client";

import type { Book } from "@/lib/types";
import { threadsWoven, futureUnlocked } from "@/lib/types";
import { OUTLINE, GROUPS, FUTURE_AREAS } from "@/lib/structure";

const FOCUS_ID = "__focus";

const TargetIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

/** Sections with real content — honest count for the progress bar. */
function bookProgress(book: Book): { done: number; total: number; pct: number } {
  let done = 0;
  let total = 0;

  const count = (has: boolean) => {
    total += 1;
    if (has) done += 1;
  };

  for (const doc of Object.values(book.docs)) {
    count(doc.wordCount > 0);
  }

  count(book.epochs.some((e) => e.text.trim().length > 0));
  count(book.traits.faults.selected.length > 0);
  count(book.traits.virtues.selected.length > 0);
  count(book.threads.insights.length > 0);

  for (const area of book.futureAreas) {
    count(area.doc.wordCount > 0);
  }

  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  return { done, total, pct };
}

const writtenCount = (b: Book) =>
  Object.values(b.docs).filter((d) => d.wordCount > 0).length;

const BookMark = () => (
  <span className="rail-book-mark" aria-hidden>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  </span>
);

export default function Sidebar({
  book,
  active,
  onSelect,
  onOpenBook,
}: {
  book: Book;
  active: string;
  onSelect: (id: string) => void;
  onOpenBook: () => void;
}) {
  const gateThreads = threadsWoven(book);
  const gateFuture = futureUnlocked(book);
  const written = writtenCount(book);
  const { pct } = bookProgress(book);

  const focusLabel =
    book.focusAreaIds.length > 0
      ? `Cycle ${book.focusCycle} · ${book.focusAreaIds.length} of 3 rooms`
      : `Cycle ${book.focusCycle} · choose three rooms`;

  return (
    <div>
      <div
        className={`rail-book ${active === "__book" ? "active" : ""}`}
        onClick={onOpenBook}
      >
        <BookMark />
        <div>
          <h1>Full Life Book</h1>
          <small>
            {written === 0
              ? "your story, still unwritten"
              : `${written} ${written === 1 ? "chapter" : "chapters"} begun`}
          </small>
        </div>
      </div>

      <div className="rail-progress" aria-hidden>
        <div className="rail-progress-top">
          <b>{pct}%</b>
        </div>
        <div className="rail-progress-track">
          <div className="rail-progress-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {OUTLINE.map((p) => (
        <div className="rail-part" key={p.part}>
          {p.part === "turning" ? (
            <div className="rail-divider">— The Turning Point —</div>
          ) : (
            <div className="rail-eyebrow">Part {p.part}</div>
          )}

          {p.lead && (
            <button
              className={`rail-item lead ${active === p.lead.id ? "active" : ""}`}
              onClick={() => onSelect(p.lead!.id)}
            >
              {p.name}
            </button>
          )}

          {p.children?.map((l) => {
            if (p.part === "IV") {
              if (l.id === "new_identity" && !gateThreads) {
                return (
                  <div className="rail-item locked" key={l.id}>
                    Begins once your Threads are woven
                  </div>
                );
              }
              if (l.id === "new_identity") {
                return (
                  <button
                    key={l.id}
                    className={`rail-item ${active === l.id ? "active" : ""}`}
                    onClick={() => onSelect(l.id)}
                  >
                    {l.title}
                  </button>
                );
              }
              return null;
            }

            return (
              <button
                key={l.id}
                className={`rail-item ${active === l.id ? "active" : ""}`}
                onClick={() => onSelect(l.id)}
              >
                {l.title}
              </button>
            );
          })}

          {p.part === "IV" &&
            (gateFuture ? (
              <>
                <div
                  className={`rail-focus ${active === FOCUS_ID ? "active" : ""}`}
                  aria-disabled
                >
                  <span className="rail-focus-ico">
                    <TargetIcon />
                  </span>
                  <span className="rail-focus-lbl">
                    Focus Cycle
                    <small>{focusLabel}</small>
                  </span>
                </div>

                {GROUPS.map((g) => (
                  <div key={g.id}>
                    <div className="rail-eyebrow" style={{ marginTop: 10 }}>
                      {g.label}
                    </div>
                    {FUTURE_AREAS.filter((a) => a.group === g.id).map((a) => (
                      <button
                        key={a.id}
                        className={`rail-item ${active === a.id ? "active" : ""}`}
                        onClick={() => onSelect(a.id)}
                      >
                        {a.title}
                      </button>
                    ))}
                  </div>
                ))}

                <div className="rail-shadow-div">— The Other Path —</div>

                <button
                  className={`rail-item rail-item-shadow ${active === "future_to_avoid" ? "active" : ""}`}
                  onClick={() => onSelect("future_to_avoid")}
                >
                  Future To Avoid
                </button>
              </>
            ) : (
              gateThreads && (
                <div className="rail-item locked">
                  Opens once you’ve met your new self
                </div>
              )
            ))}
        </div>
      ))}
    </div>
  );
}
