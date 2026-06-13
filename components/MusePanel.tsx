"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import type { Book, MuseMode, Theme } from "@/lib/types";
import { leafInfo } from "@/lib/structure";
import { useSaveStatus } from "@/components/AuthGate";
import {
  SANDBOX_MUSE,
  sandboxWayOfSeeing,
  type SandboxWayOfSeeing,
} from "@/lib/sandbox/sandboxMuse";
import { DIRECTION_FROM_LABEL } from "@/lib/sandbox/sandboxQuestions";

const BOOK_ID = "__book";

const CONTEXT: Record<MuseMode, string> = {
  helper: "names who you already are",
  questioner: "asks; the story is yours",
  mirror: "reflects what hides beneath",
  synthesizer: "listens for your threads",
  coauthor: "writes the life you’re moving toward",
  weaver: "weaves the chapters into one",
  editor: "reads alongside you",
};

const MODE_LABEL: Record<MuseMode, string> = {
  helper: "Helper",
  questioner: "Questioner",
  mirror: "Mirror",
  synthesizer: "Synthesizer",
  coauthor: "Coauthor",
  weaver: "Weaver",
  editor: "Editor",
};

const LEVEL1 = [
  "Understand myself",
  "Explore my past",
  "Find patterns",
  "Continue writing",
  "Strengthen my future",
  "Surprise me",
] as const;

const LEVEL2: Record<(typeof LEVEL1)[number], string[]> = {
  "Understand myself": [
    "Where did this come from?",
    "What has it cost you?",
    "Would your future self agree?",
    "What are you protecting?",
  ],
  "Explore my past": [
    "What moment does this connect to?",
    "Who were you then?",
    "What did you decide that day?",
    "What would you tell that version of you?",
  ],
  "Find patterns": [
    "Where does this show up again?",
    "What keeps repeating quietly?",
    "What tension sits beneath it?",
    "What are you not naming yet?",
  ],
  "Continue writing": [
    "What comes next if you stay honest?",
    "What are you leaving unsaid?",
    "What detail would make this real?",
    "Where does the thread lead?",
  ],
  "Strengthen my future": [
    "What would it look like if this were already true?",
    "Who did you become to live this?",
    "What feels just out of reach?",
    "What would your future self notice first?",
  ],
  "Surprise me": [
    "What are you avoiding in plain sight?",
    "What would change if you reversed it?",
    "What does this remind you of?",
    "What question haven't you asked?",
  ],
};

function wordCountForSection(book: Book, active: string): number {
  if (active === BOOK_ID) return 0;
  const doc = book.docs[active];
  if (doc) return doc.wordCount;
  const area = book.futureAreas.find((a) => a.id === active);
  if (area) return area.doc.wordCount;
  return 0;
}

function sectionContext(active: string) {
  if (active === BOOK_ID) {
    return { chapter: "Full Life Book", part: "Cover" };
  }
  const info = leafInfo(active);
  return {
    chapter: info?.title ?? "This chapter",
    part: info?.partLabel ?? "Your book",
  };
}

function saveStatusLabel(status: ReturnType<typeof useSaveStatus>): string {
  switch (status) {
    case "saving":
      return "Saving…";
    case "saved":
      return "● Saved";
    case "error":
      return "Couldn't save";
    default:
      return "—";
  }
}

type ConvoTurn = {
  user: string;
  muse?: SandboxWayOfSeeing;
};

export default function MusePanel({
  mode,
  theme,
  onToggleTheme,
  active,
  book,
}: {
  mode: MuseMode;
  theme: Theme;
  onToggleTheme: () => void;
  active: string;
  book: Book;
}) {
  const saveStatus = useSaveStatus();
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [inputValue, setInputValue] = useState("");
  const [focused, setFocused] = useState(false);
  const [selectedDirection, setSelectedDirection] = useState<
    (typeof LEVEL1)[number] | null
  >(null);
  const [turns, setTurns] = useState<ConvoTurn[]>([]);

  const { chapter, part } = sectionContext(active);
  const words = wordCountForSection(book, active);
  const wordLabel = words > 0 ? words.toLocaleString() : "0";
  const statusLabel = saveStatusLabel(saveStatus);
  const statusSaved = saveStatus === "saved";

  const isCompressed =
    focused || inputValue.trim().length > 0 || turns.length > 0;
  const isConversation = turns.length > 0;
  const headerSub = isCompressed ? "listening" : "reading beside you";

  const handleFocus = () => {
    setFocused(true);
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    });
  };

  const handleBlur = () => {
    setFocused(false);
    if (!inputRef.current?.value.trim() && turns.length === 0) {
      setSelectedDirection(null);
      setInputValue("");
    }
  };

  const handleSubmit = () => {
    const text = inputValue.trim();
    if (!text) return;
    const directionKey = selectedDirection
      ? (DIRECTION_FROM_LABEL[selectedDirection] ?? null)
      : null;
    const muse = SANDBOX_MUSE ? sandboxWayOfSeeing(directionKey) : undefined;
    setTurns((prev) => [...prev, { user: text, muse }]);
    setInputValue("");
    setSelectedDirection(null);
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    });
  };

  const onFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleSubmit();
  };

  const onInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  useEffect(() => {
    if (!focused && !inputValue.trim() && turns.length === 0) {
      scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [focused, inputValue, turns.length]);

  return (
    <div
      className={`muse-panel${isCompressed ? " muse-panel--active" : ""}${
        isConversation ? " muse-panel--conversation" : ""
      }`}
    >
      <header className="muse-head">
        <div className="muse-row">
          <div className="muse-orb-wrap" aria-hidden>
            <span className="muse-orb-halo" />
            <span className="muse-orb-core" />
          </div>
          <div className="muse-head-text">
            <div className="muse-name">The Muse</div>
            <div className="muse-sub">{headerSub}</div>
          </div>
          <button type="button" className="muse-edition" onClick={onToggleTheme}>
            {theme === "night" ? "Linen edition" : "Velvet edition"}
          </button>
        </div>
        <div className="muse-mode-line">{CONTEXT[mode]}</div>
      </header>

      <div className="muse-scroll" ref={scrollRef}>
        {/* Current context */}
        <section className="muse-section">
          <p className="muse-eyebrow">Current context</p>
          <div className="muse-card">
            <div className="muse-ctx-grid">
              <div className="muse-ctx-row">
                <span className="muse-ctx-k">Chapter</span>
                <span className="muse-ctx-v">{chapter}</span>
              </div>
              <div className="muse-ctx-row">
                <span className="muse-ctx-k">Part</span>
                <span className="muse-ctx-v muse-ctx-v--muted">{part}</span>
              </div>
              <div className="muse-ctx-row">
                <span className="muse-ctx-k">Words</span>
                <span className="muse-ctx-v">{wordLabel}</span>
              </div>
              <div className="muse-ctx-row">
                <span className="muse-ctx-k">Status</span>
                <span
                  className={`muse-ctx-v${statusSaved ? " muse-ctx-v--saved" : ""}`}
                >
                  {statusLabel}
                </span>
              </div>
              <div className="muse-ctx-row">
                <span className="muse-ctx-k">Mode</span>
                <span className="muse-mode-pill">{MODE_LABEL[mode]}</span>
              </div>
            </div>
          </div>
          <div className="muse-mini">
            <span className="muse-mini-dot" />
            <b>{chapter}</b>
            <span className="muse-mini-sub">· {wordLabel} words</span>
          </div>
        </section>

        {/* Emerging signals — honest empty */}
        <section className="muse-section">
          <p className="muse-eyebrow">Emerging signals</p>
          <div className="muse-card muse-card--empty">
            <h4 className="muse-empty-title">Too early to see patterns</h4>
            <p className="muse-empty-body">
              Signals will surface here as themes repeat across your book — once
              the Muse can read across it.
            </p>
          </div>
          <div className="muse-mini">
            <span className="muse-mini-dot muse-mini-dot--faint" />
            No signals yet
          </div>
        </section>

        {/* Insights pending — honest empty */}
        <section className="muse-section">
          <p className="muse-eyebrow">Insights pending</p>
          <div className="muse-card muse-card--empty">
            <svg
              className="muse-empty-glyph"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.3}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4" />
              <circle cx="12" cy="12" r="3.4" />
            </svg>
            <h4 className="muse-empty-title">Nothing yet — and that&apos;s right</h4>
            <p className="muse-empty-body">
              The Muse will surface recurring themes or tensions here for your
              consideration — when it can read across your book.
            </p>
            <div className="muse-ghost-actions">
              <button type="button" className="muse-ghost-btn muse-ghost-btn--accept" disabled>
                Accept
              </button>
              <button type="button" className="muse-ghost-btn" disabled>
                Dismiss
              </button>
            </div>
          </div>
          <div className="muse-mini">
            <span className="muse-mini-dot muse-mini-dot--faint" />
            No insights yet
          </div>
        </section>

        {/* Threads — honest empty */}
        <section className="muse-section">
          <p className="muse-eyebrow">Threads</p>
          <div className="muse-card muse-card--empty">
            <svg
              className="muse-empty-glyph"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.3}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M6 3v13a3 3 0 0 0 6 0V8a3 3 0 0 1 6 0v13" />
              <circle cx="6" cy="3" r="1.4" />
              <circle cx="18" cy="21" r="1.4" />
            </svg>
            <h4 className="muse-empty-title">No threads woven yet</h4>
            <p className="muse-empty-body">
              Accepted insights become threads — the lines of meaning that run
              quietly through your book.
            </p>
            <div className="muse-thread-motif" aria-hidden />
          </div>
          <div className="muse-mini">
            <span className="muse-mini-dot muse-mini-dot--faint" />
            No threads yet
          </div>
        </section>

        {/* Conversation area */}
        <div className="muse-convo-area">
          <div className="muse-convo-rule" />
          <div className="muse-convo-context">
            <span className="muse-convo-dot" aria-hidden />
            {chapter}
            <span className="muse-convo-mode">· {MODE_LABEL[mode]}</span>
          </div>

          {turns.map((turn, i) => (
            <div key={i}>
              <div className="muse-user-msg">{turn.user}</div>
              {turn.muse && (
                <div className="muse-way-card">
                  <p className="muse-way-label">A way of seeing —</p>
                  <p className="muse-way-question">{turn.muse.question}</p>
                  <p className="muse-way-honest">{turn.muse.honestLine}</p>
                  {turn.muse.nudge && (
                    <p className="muse-way-nudge">{turn.muse.nudge}</p>
                  )}
                </div>
              )}
            </div>
          ))}

          {!isConversation && (
            <>
              <p className="muse-convo-lead">
                {selectedDirection ? "A few ways of seeing" : "Choose a direction"}
              </p>
              <div className="muse-starters">
                {(selectedDirection ? LEVEL2[selectedDirection] : LEVEL1).map(
                  (label) => (
                    <button
                      key={label}
                      type="button"
                      className="muse-starter"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        if (selectedDirection) {
                          setInputValue(label);
                          inputRef.current?.focus();
                        } else {
                          setSelectedDirection(label as (typeof LEVEL1)[number]);
                        }
                      }}
                    >
                      {label}
                      <span className="muse-starter-arr" aria-hidden>
                        ↵
                      </span>
                    </button>
                  )
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <footer className="muse-composer">
        <form className="muse-field" onSubmit={onFormSubmit}>
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={onInputKeyDown}
            placeholder="Ask the Muse…"
            autoComplete="off"
            aria-label="Ask the Muse"
          />
          <button type="submit" className="muse-send" aria-label="Send">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
        </form>
        <p className="muse-composer-note">
          {SANDBOX_MUSE
            ? "Temporary sandbox — for rhythm only."
            : "The Muse will answer once intelligence is connected."}
        </p>
      </footer>
    </div>
  );
}
