// lib/structure.ts
// The fixed information architecture. This is CONFIG, not user state.
// The sidebar renders from OUTLINE; the 16 rooms come from FUTURE_AREAS.

import type { FutureGroup, Part, SectionKind } from "./types";

export interface LeafDef {
  id: string; // doc slug or area id
  title: string;
  kind: SectionKind;
  trait?: "faults" | "virtues";
}

export interface PartDef {
  part: Part;
  name: string;
  lead?: LeafDef; // single-leaf parts (Identity, Life Vision)
  children?: LeafDef[];
}

export const GROUPS: { id: FutureGroup; label: string }[] = [
  { id: "inner", label: "Inner World" },
  { id: "body", label: "Body & Physical Life" },
  { id: "work", label: "Work & Wealth" },
  { id: "relationships", label: "Relationships & Community" },
  { id: "lifestyle", label: "Lifestyle & Experience" },
  { id: "purpose", label: "Purpose & Impact" },
];

export interface AreaDef {
  id: string;
  group: FutureGroup;
  title: string;
  hint?: string;
  frame?: string; // one-line "why this room matters" shown above the editor (not saved)
}

export const FUTURE_AREAS: AreaDef[] = [
  {
    id: "f_spiritual",
    group: "inner",
    title: "Spiritual Life & Self-Development",
    frame:
      "This is where you tend to what\u2019s beneath everything else \u2014 your relationship to meaning, to growth, to whatever you hold sacred. The inner work the rest of your life rests on.",
  },
  {
    id: "f_emotional",
    group: "inner",
    title: "Emotional Life & Environment",
    frame:
      "Here you describe the inner weather you want to live in \u2014 how you want to feel day to day, and what kind of emotional ground you\u2019re choosing to stand on.",
  },
  {
    id: "f_intellect",
    group: "inner",
    title: "Intellectual Life & Traits",
    frame:
      "This is the life of your mind \u2014 what you want to learn, think about, and stay curious toward. The ideas you want to keep growing into.",
  },
  {
    id: "f_personality",
    group: "inner",
    title: "Personality, Character & Appearance",
    frame:
      "This is where you describe the person others meet \u2014 the character you\u2019re building, and the way you want to carry yourself through the world.",
  },
  {
    id: "f_health",
    group: "body",
    title: "Health & Wellbeing",
    hint: "sleep, nutrition, energy, mental wellbeing, longevity",
    frame:
      "Your future is carried by your body. This is where you imagine the energy, vitality, and wellbeing that make the rest of the life you\u2019re building possible.",
  },
  {
    id: "f_fitness",
    group: "body",
    title: "Fitness",
    hint: "strength, body composition, athleticism, mobility, performance",
    frame:
      "This is where you describe what your body can do \u2014 the strength, capability, and physical confidence you want to live inside of.",
  },
  {
    id: "f_environment",
    group: "body",
    title: "Physical & Living Environment",
    frame:
      "The spaces you live in shape who you become in them. This is where you describe the home and surroundings that hold the life you\u2019re building.",
  },
  {
    id: "f_work",
    group: "work",
    title: "Work Life",
    frame:
      "This is where you describe the work itself \u2014 what you spend your days doing, and what you want that work to mean to you.",
  },
  {
    id: "f_business",
    group: "work",
    title: "Business",
    frame:
      "This is where you imagine what you build and own \u2014 the ventures, the value you create, and the way you want to make your mark.",
  },
  {
    id: "f_financial",
    group: "work",
    title: "Financial Life",
    frame:
      "Money is freedom made practical. This is where you describe the relationship to wealth that supports the life you actually want \u2014 not the one you\u2019re told to want.",
  },
  {
    id: "f_social",
    group: "relationships",
    title: "Social Life & Community",
    frame:
      "This is where you describe the wider circle you want around you \u2014 the friendships, the belonging, the community a full life is lived within.",
  },
  {
    id: "f_relationships",
    group: "relationships",
    title: "Relationships",
    frame:
      "No future is built alone. This is where you describe the closest bonds \u2014 the love, partnership, and connection you want your life to be surrounded by.",
  },
  {
    id: "f_family",
    group: "relationships",
    title: "Parenting & Family Dynamics",
    frame:
      "This is where you describe the family you come from and the one you\u2019re creating \u2014 the dynamics you want to nurture, and the ones you\u2019re choosing to change.",
  },
  {
    id: "f_quality",
    group: "lifestyle",
    title: "Quality of Life",
    frame:
      "This is where you describe the texture of an ordinary day \u2014 the rhythm, ease, and richness you want your everyday life to actually feel like.",
  },
  {
    id: "f_lifestyle",
    group: "lifestyle",
    title: "Lifestyle & Experiences",
    frame:
      "A life is made of what you do with it. This is where you imagine the experiences, adventures, and ways of living you want to fill your years with.",
  },
  {
    id: "f_purpose",
    group: "purpose",
    title: "Purpose, Legacy & Making a Difference",
    frame:
      "This is the place where contribution becomes visible \u2014 not what you achieve, but the difference you hope your life leaves behind.",
  },
];

export const OUTLINE: PartDef[] = [
  {
    part: "I",
    name: "Identity (Now)",
    lead: { id: "identity_now", title: "Identity (Now)", kind: "doc" },
  },
  {
    part: "II",
    name: "Past",
    children: [
      { id: "epochs", title: "Life Epochs", kind: "epochs" },
      { id: "key_exp", title: "Key Experiences", kind: "doc" },
    ],
  },
  {
    part: "III",
    name: "Present",
    children: [
      { id: "faults", title: "Faults", kind: "traits", trait: "faults" },
      { id: "virtues", title: "Virtues", kind: "traits", trait: "virtues" },
    ],
  },
  {
    part: "turning",
    name: "The Turning Point",
    children: [{ id: "threads", title: "Threads of My Story", kind: "threads" }],
  },
  {
    part: "IV",
    name: "Future",
    children: [{ id: "new_identity", title: "New Identity", kind: "doc" }],
    // Focus Cycle, 16 FUTURE_AREAS, and Future To Avoid render in Sidebar.tsx.
  },
  {
    part: "V",
    name: "Life Vision",
    lead: { id: "vision", title: "Life Vision", kind: "vision" },
  },
];

/** Muse mode for a given section id — used by the AI proxy in step 10. */
export function museModeFor(id: string): import("./types").MuseMode {
  if (id === "identity_now") return "helper";
  if (id === "epochs" || id === "key_exp") return "questioner";
  if (id === "faults" || id === "virtues") return "mirror";
  if (id === "threads") return "synthesizer";
  if (id === "vision") return "weaver";
  return "coauthor"; // new_identity, future areas, future_to_avoid
}

/** Resolve a section id to its part label + title (for chapter headings). */
export function leafInfo(
  id: string
): { partLabel: string; title: string } | null {
  for (const p of OUTLINE) {
    const partLabel =
      p.part === "turning" ? "The Turning Point" : `Part ${p.part} · ${p.name}`;
    if (p.lead?.id === id) return { partLabel, title: p.lead.title };
    const child = p.children?.find((l) => l.id === id);
    if (child) return { partLabel, title: child.title };
  }
  const area = FUTURE_AREAS.find((a) => a.id === id);
  if (area) return { partLabel: "Part IV · Future", title: area.title };
  if (id === "future_to_avoid")
    return { partLabel: "Part IV · Future", title: "Future To Avoid" };
  return null;
}
