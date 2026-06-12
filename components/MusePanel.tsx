// components/MusePanel.tsx
"use client";

import type { MuseMode, Theme } from "@/lib/types";

const PRESENCE: Record<MuseMode, string> = {
  helper: "Here, I help you find the words for who you already are.",
  questioner: "Here, I mostly ask. The story is yours to tell.",
  mirror: "Here, I reflect back what you write — and what hides beneath it.",
  synthesizer:
    "Here, I listen for the threads that run through everything you’ve written.",
  coauthor:
    "Here, we write the life you’re moving toward, as if it were already yours.",
  weaver: "Here, I help you weave the chapters into one.",
  editor: "Here, I read alongside you, and help you see it again.",
};

const CONTEXT: Record<MuseMode, string> = {
  helper: "names who you already are",
  questioner: "asks; the story is yours",
  mirror: "reflects what hides beneath",
  synthesizer: "listens for your threads",
  coauthor: "writes the life you’re moving toward",
  weaver: "weaves the chapters into one",
  editor: "reads alongside you",
};

const PLACEHOLDER_CHIPS = [
  "What would it look like if…",
  "Who am I becoming?",
  "Describe a normal day",
];

export default function MusePanel({
  mode,
  theme,
  onToggleTheme,
}: {
  mode: MuseMode;
  theme: Theme;
  onToggleTheme: () => void;
}) {
  return (
    <div className="muse-panel">
      <div className="muse-head">
        <div className="muse-head-top">
          <h2>
            <span className="muse-orb" aria-hidden />
            The Muse
          </h2>
          <button type="button" className="muse-edition" onClick={onToggleTheme}>
            {theme === "night" ? "Linen edition" : "Velvet edition"}
          </button>
        </div>
        <small className="muse-ctx">{CONTEXT[mode]}</small>
      </div>

      <div className="muse-chips">
        {PLACEHOLDER_CHIPS.map((label) => (
          <button key={label} type="button" className="muse-chip" disabled>
            {label}
          </button>
        ))}
      </div>

      <div className="muse-log">
        <p className="muse-presence">{PRESENCE[mode]}</p>
        <p className="muse-quiet">Begin writing, and I’ll meet you in it.</p>
      </div>

      <div className="muse-input">
        <textarea
          placeholder="Ask the Muse…"
          rows={1}
          disabled
          aria-disabled
        />
        <button type="button" className="muse-send" disabled aria-label="Send">
          ↑
        </button>
      </div>
    </div>
  );
}
