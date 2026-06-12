// lib/chapters.ts
// The registry of simple writing chapters. Add a chapter = add one entry here.
// Each entry supplies a lede + seed; title/eyebrow come from structure.ts.
//
// Slugs must match both the sidebar leaf id and the database section slug.
// Already-wired data slots (book-store.ts): key_exp, new_identity,
// future_to_avoid, vision.

import type { DocJSON } from "./types";
import { keyExperiencesSeedContent } from "./seeds";

export interface ChapterDef {
  slug: string;
  lede: string;
  seed?: () => DocJSON;
}

export const CHAPTERS: Record<string, ChapterDef> = {
  key_exp: {
    slug: "key_exp",
    lede: "The moments that made you who you are.",
    seed: keyExperiencesSeedContent,
  },

  // Proven next, one entry at a time:
  // new_identity:    { slug: "new_identity",    lede: "...", seed: newIdentitySeedContent },
  // future_to_avoid: { slug: "future_to_avoid", lede: "...", seed: futureToAvoidSeedContent },
  // vision:          { slug: "vision",          lede: "...", seed: visionSeedContent },
};
