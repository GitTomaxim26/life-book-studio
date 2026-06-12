// components/Sidebar.tsx
"use client";

import type { Book } from "@/lib/types";
import { threadsWoven, futureUnlocked } from "@/lib/types";
import { OUTLINE, GROUPS, FUTURE_AREAS } from "@/lib/structure";

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

      {OUTLINE.map((p) => (
        <div className="rail-part" key={p.part}>
          {p.part === "turning" ? (
            <div className="rail-divider">— The Turning Point —</div>
          ) : (
            <div className="rail-eyebrow">
              {p.part !== "I" && p.part !== "V" ? `Part ${p.part}` : `Part ${p.part}`}
            </div>
          )}

          {/* single-leaf parts */}
          {p.lead && (
            <button
              className={`rail-item lead ${active === p.lead.id ? "active" : ""}`}
              onClick={() => onSelect(p.lead!.id)}
            >
              {p.name}
            </button>
          )}

          {/* child leaves */}
          {p.children?.map((l) => {
            // New Identity is gated by Threads.
            if (l.id === "new_identity" && !gateThreads) {
              return (
                <div className="rail-item locked" key={l.id}>
                  Begins once your Threads are woven
                </div>
              );
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

          {/* Future: the 16 rooms + Future To Avoid live inside Part IV, gated by New Identity */}
          {p.part === "IV" &&
            (gateFuture ? (
              <>
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
              </>
            ) : (
              <div className="rail-item locked">
                Opens once you’ve met your new self
              </div>
            ))}
        </div>
      ))}
    </div>
  );
}
