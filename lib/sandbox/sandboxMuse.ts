/**
 * Temporary Sandbox Muse — delete this file and lib/sandbox/ when real Muse is wired.
 * Set to false to restore the disconnected composer note and no canned responses.
 */
import {
  OPEN_MODE_QUESTIONS,
  SANDBOX_QUESTIONS,
  type SandboxDirection,
} from "./sandboxQuestions";

export const SANDBOX_MUSE = true;

export const SANDBOX_HONEST_LINE =
  "When the Muse can read your book, the questions it offers may emerge from your own writing. For now, this is simply a place to begin.";

export const OPEN_MODE_NUDGE =
  "You may also choose a direction above — the question will follow that path, not your words.";

function pickFromPool(pool: string[]): string {
  return pool[Math.floor(Math.random() * pool.length)];
}

/** Returns a canned question for the chosen direction, or an open-mode question if none. */
export function pickSandboxQuestion(
  direction: SandboxDirection | null
): string {
  if (!direction) return pickFromPool(OPEN_MODE_QUESTIONS);
  return pickFromPool(SANDBOX_QUESTIONS[direction]);
}

export type SandboxWayOfSeeing = {
  question: string;
  honestLine: string;
  nudge?: string;
};

export function sandboxWayOfSeeing(
  direction: SandboxDirection | null
): SandboxWayOfSeeing {
  return {
    question: pickSandboxQuestion(direction),
    honestLine: SANDBOX_HONEST_LINE,
    nudge: direction ? undefined : OPEN_MODE_NUDGE,
  };
}
