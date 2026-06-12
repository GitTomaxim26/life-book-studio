// components/MusePanel.tsx
"use client";

import type { MuseMode, Theme } from "@/lib/types";

const LABEL: Record<MuseMode, string> = {
  helper: "Helper",
  questioner: "Questioner",
  mirror: "Mirror",
  synthesizer: "Synthesizer",
  coauthor: "Co-author",
  weaver: "Weaver",
  editor: "Editor",
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
        <button
          onClick={onToggleTheme}
          className="cover-links"
          style={{ background: "transparent", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: 12.5 }}
        >
          {theme === "night" ? "Linen edition" : "Velvet edition"}
        </button>
      </div>
      <p className="muse-note">
        Mode here: <strong style={{ color: "var(--text-2)" }}>{LABEL[mode]}</strong>. The Muse changes character by
        section — it asks in the Past, mirrors in the Present, co-authors in the
        Future.
      </p>
      <p className="muse-note" style={{ marginTop: 14 }}>
        Wired in <strong style={{ color: "var(--text-2)" }}>step 10</strong> to a streaming
        <code> /api/muse </code> route handler. Keys stay server-side.
      </p>
    </div>
  );
}
