// components/MusePanel.tsx
"use client";

import type { MuseMode, Theme } from "@/lib/types";

// The Muse is present from the first moment — before any AI exists.
// It speaks as a companion to the writing, never about how it's built.
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
    <div>
      <div className="muse-head">
        <h2>The Muse</h2>
        <button className="muse-edition" onClick={onToggleTheme}>
          {theme === "night" ? "Linen edition" : "Velvet edition"}
        </button>
      </div>
      <p className="muse-presence">{PRESENCE[mode]}</p>
      <p className="muse-quiet">Begin writing, and I’ll meet you in it.</p>
    </div>
  );
}
