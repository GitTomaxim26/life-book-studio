"use client";

// components/ThreadsPage.tsx
// The Turning Point. NOT a prose chapter and NOT AI output — the author's own
// distilled realizations, woven by hand. Adding one insight unlocks Part IV.
// Recurrence/"repeats" is deliberately absent here; it belongs to the future Muse.

import { useState } from "react";
import type { Book, ThreadsResult } from "@/lib/types";
import { useSaveThreads } from "@/components/AuthGate";
import ResetChapterButton from "./ResetChapterButton";

export default function ThreadsPage({
  book,
  onChange,
}: {
  book: Book;
  onChange: (b: Book) => void;
}) {
  const threads = book.threads;
  const save = useSaveThreads();
  const [draft, setDraft] = useState("");

  // Single place that updates state + persists.
  const commit = (next: ThreadsResult) => {
    onChange({ ...book, threads: next });
    save(next);
  };

  const addInsight = () => {
    const text = draft.trim();
    if (!text) return;
    commit({ ...threads, insights: [...threads.insights, text] });
    setDraft("");
  };

  const editInsight = (i: number, text: string) => {
    const insights = threads.insights.slice();
    insights[i] = text;
    commit({ ...threads, insights });
  };

  const removeInsight = (i: number) => {
    commit({ ...threads, insights: threads.insights.filter((_, j) => j !== i) });
  };

  const setBecoming = (becoming: string) => commit({ ...threads, becoming });

  const woven = threads.insights.length > 0;

  return (
    <div className="center-view">
      <div className="center-scroll">
        <div className="threads-page">
      <div className="doc-head">
        <div className="doc-head-eb">The Turning Point</div>
        <h1 className="doc-head-title">Threads of My Story</h1>
        <p className="doc-head-lede">
          The threads you’ve come to see running through your story — named in your
          own words.
        </p>
        <ResetChapterButton
          slug="threads"
          book={book}
          onChange={(b) => {
            onChange(b);
            setDraft("");
          }}
        />
      </div>

      <section className="threads-section">
        <h2 className="threads-h">The threads I’ve come to see</h2>
        <p className="threads-note">
          Not patterns a machine found — realizations <em>you</em> have drawn from your
          own pages. Add them one at a time.
        </p>

        {threads.insights.length > 0 && (
          <ul className="threads-list">
            {threads.insights.map((text, i) => (
              <li className="threads-item" key={i}>
                <textarea
                  className="threads-item-input"
                  value={text}
                  rows={2}
                  onChange={(e) => editInsight(i, e.target.value)}
                  aria-label={`Thread ${i + 1}`}
                />
                <button
                  className="threads-remove"
                  onClick={() => removeInsight(i)}
                  aria-label="Remove this thread"
                  title="Remove"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="threads-add">
          <textarea
            className="threads-add-input"
            placeholder="A thread you’ve come to see… (e.g. “I keep choosing safety over the thing I actually want.”)"
            value={draft}
            rows={2}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                addInsight();
              }
            }}
          />
          <button className="threads-add-btn" onClick={addInsight} disabled={!draft.trim()}>
            Weave this thread
          </button>
        </div>

        {!woven && (
          <p className="threads-gate-hint">
            Naming your first thread opens the way to your New Identity.
          </p>
        )}
      </section>

      <section className="threads-section">
        <h2 className="threads-h">Who I am becoming</h2>
        <p className="threads-note">
          When the threads are gathered, say — in a few sentences — who they are
          turning you into.
        </p>
        <textarea
          className="threads-becoming"
          placeholder="From these threads, I can see I am becoming…"
          value={threads.becoming}
          rows={5}
          onChange={(e) => setBecoming(e.target.value)}
        />
      </section>

      {/* Quiet future-state seam: recurrence belongs to the Muse, not to this page.
          No counts, no fabricated patterns — just an honest note of what will live here. */}
      <p className="threads-future-seam">
        Recurring patterns will appear here once the Muse can read across your whole
        book.
      </p>
        </div>
      </div>
    </div>
  );
}
