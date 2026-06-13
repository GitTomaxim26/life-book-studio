// components/SaveIndicator.tsx
// Quiet, honest save status. Shows nothing when idle.
"use client";

import { useSaveStatus } from "./AuthGate";

export default function SaveIndicator() {
  const status = useSaveStatus();
  if (status === "idle") return null;

  const label =
    status === "saving" ? "Saving…" : status === "saved" ? "Saved" : "Couldn’t save";

  return <span className={`save-status save-status--${status}`}>{label}</span>;
}
