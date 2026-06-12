// components/Sidebar.tsx
"use client";

import type { Book } from "@/lib/types";
import { threadsWoven, futureUnlocked } from "@/lib/types";
import { OUTLINE, GROUPS, FUTURE_AREAS } from "@/lib/structure";

const writtenCount = (b: Book) =>
  Object.values(b.docs).filter((d) => d.wordCount > 0).length;

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

  return (
    <div>
      <div
        className={`rail-book ${active === "__book" ? "active" : ""}`}
        onClick={onOpenBook}
      >
        <span aria-hidden>📖</span>
        <div>
          <h1>Full Life Book</h1>
          <small>{writtenCount(book)} sections written</small>
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
                  Unlocks when you weave your Threads
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
                The future opens once your New Identity is written
              </div>
            ))}
        </div>
      ))}
    </div>
  );
}
