// lib/chapters.ts
// The registry of simple writing chapters. Add a chapter = add one entry here.
// Each entry supplies a lede + seed; title/eyebrow come from structure.ts.
//
// Slugs must match both the sidebar leaf id and the database section slug.
// Already-wired data slots (book-store.ts): key_exp, new_identity,
// future_to_avoid, vision.

import type { DocJSON } from "./types";
import {
  keyExperiencesSeedContent,
  newIdentitySeedContent,
  futureToAvoidSeedContent,
  visionSeedContent,
} from "./seeds";

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
  new_identity: {
    slug: "new_identity",
    lede: "The person this book is being written toward.",
    seed: newIdentitySeedContent,
  },
  future_to_avoid: {
    slug: "future_to_avoid",
    lede: "The life you're choosing not to live.",
    seed: futureToAvoidSeedContent,
  },
  vision: {
    slug: "vision",
    lede: "The whole life, pulled into focus.",
    seed: visionSeedContent,
  },
};
