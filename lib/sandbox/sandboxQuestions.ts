/** Temporary sandbox — delete with lib/sandbox/ when real Muse is wired. */

export type SandboxDirection =
  | "understand_myself"
  | "explore_past"
  | "find_patterns"
  | "continue_writing"
  | "strengthen_future"
  | "surprise_me";

/** Maps Level-1 labels in MusePanel to sandbox direction ids. */
export const DIRECTION_FROM_LABEL: Record<string, SandboxDirection> = {
  "Understand myself": "understand_myself",
  "Explore my past": "explore_past",
  "Find patterns": "find_patterns",
  "Continue writing": "continue_writing",
  "Strengthen my future": "strengthen_future",
  "Surprise me": "surprise_me",
};

export const SANDBOX_QUESTIONS: Record<SandboxDirection, string[]> = {
  understand_myself: [
    "What do you already know about yourself that you haven't written yet?",
    "Where did this way of being begin?",
    "What would it mean to name this without judging it?",
    "What are you protecting by not saying it plainly?",
  ],
  explore_past: [
    "What moment does this connect to?",
    "Who were you in that season?",
    "What did you decide that day — and have you kept that decision?",
    "What would you tell that earlier version of you?",
  ],
  find_patterns: [
    "Where does this show up again in your life?",
    "What keeps repeating quietly?",
    "What tension sits beneath the surface?",
    "What are you not naming yet?",
  ],
  continue_writing: [
    "What comes next if you stay honest?",
    "What are you leaving unsaid on the page?",
    "What detail would make this real?",
    "Where does the thread lead if you follow it?",
  ],
  strengthen_future: [
    "What would it look like if this were already true?",
    "Who did you become to live this?",
    "What feels just out of reach?",
    "What would your future self notice first?",
  ],
  surprise_me: [
    "What are you avoiding in plain sight?",
    "What would change if you reversed it?",
    "What does this remind you of — unexpectedly?",
    "What question haven't you asked yet?",
  ],
};

/** Open mode — not tied to any direction; never derived from user text. */
export const OPEN_MODE_QUESTIONS: string[] = [
  "What are you trying to see more clearly?",
  "What feels unfinished on the page right now?",
  "What would it mean to stay with this a little longer?",
  "What is waiting to be named?",
];
