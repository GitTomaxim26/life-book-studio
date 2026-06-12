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
}

export const FUTURE_AREAS: AreaDef[] = [
  { id: "f_spiritual", group: "inner", title: "Spiritual Life & Self-Development" },
  { id: "f_emotional", group: "inner", title: "Emotional Life & Environment" },
  { id: "f_intellect", group: "inner", title: "Intellectual Life & Traits" },
  { id: "f_personality", group: "inner", title: "Personality, Character & Appearance" },
  { id: "f_health", group: "body", title: "Health & Wellbeing", hint: "sleep, nutrition, energy, mental wellbeing, longevity" },
  { id: "f_fitness", group: "body", title: "Fitness", hint: "strength, body composition, athleticism, mobility, performance" },
  { id: "f_environment", group: "body", title: "Physical & Living Environment" },
  { id: "f_work", group: "work", title: "Work Life" },
  { id: "f_business", group: "work", title: "Business" },
  { id: "f_financial", group: "work", title: "Financial Life" },
  { id: "f_social", group: "relationships", title: "Social Life & Community" },
  { id: "f_relationships", group: "relationships", title: "Relationships" },
  { id: "f_family", group: "relationships", title: "Parenting & Family Dynamics" },
  { id: "f_quality", group: "lifestyle", title: "Quality of Life" },
  { id: "f_lifestyle", group: "lifestyle", title: "Lifestyle & Experiences" },
  { id: "f_purpose", group: "purpose", title: "Purpose, Legacy & Making a Difference" },
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
    children: [
      { id: "new_identity", title: "New Identity", kind: "doc" },
      // Focus Cycle + the 16 FUTURE_AREAS render between these two,
      { id: "future_to_avoid", title: "Future To Avoid", kind: "doc" },
    ],
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
  return null;
}
