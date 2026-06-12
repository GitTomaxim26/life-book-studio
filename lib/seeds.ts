import type { DocJSON } from "./types";

const h2 = (text: string) => ({
  type: "heading" as const,
  attrs: { level: 2 },
  content: [{ type: "text" as const, text }],
});

const prompt = (text: string) => ({
  type: "paragraph" as const,
  attrs: { class: "prompt", "data-prompt": "true" },
  content: [{ type: "text" as const, text }],
});

const blank = () => ({ type: "paragraph" as const });

/** Identity chapter opening shape — editable TipTap content, not UI chrome. */
export function identitySeedContent(): DocJSON {
  return {
    type: "doc",
    content: [
      h2("Heroes"),
      prompt("Who do you admire, and what does that admiration reveal about you?"),
      blank(),
      h2("Anti-heroes"),
      prompt("Who do you refuse to become? What do they show you about your values?"),
      blank(),
      h2("Values"),
      prompt("What do you hold to, even when it costs you?"),
      blank(),
      h2("Beliefs"),
      prompt(
        "What do you believe about how the world works, and your place in it?"
      ),
      blank(),
    ],
  };
}

/** True when a doc is empty or only a blank paragraph — seed may apply. */
export function isDocEmpty(content: DocJSON | null | undefined): boolean {
  if (!content || typeof content !== "object") return true;
  const doc = content as { content?: Array<{ type?: string; content?: unknown[] }> };
  const nodes = doc.content;
  if (!nodes?.length) return true;
  if (nodes.length === 1) {
    const node = nodes[0];
    if (node.type === "paragraph" && (!node.content || node.content.length === 0))
      return true;
  }
  return false;
}

/** Word count from TipTap JSON (plain text nodes only). */
export function wordCountFromDoc(content: DocJSON): number {
  const texts: string[] = [];
  const walk = (node: unknown) => {
    if (!node || typeof node !== "object") return;
    const n = node as { type?: string; text?: string; content?: unknown[] };
    if (n.type === "text" && n.text) texts.push(n.text);
    n.content?.forEach(walk);
  };
  walk(content);
  const joined = texts.join(" ").trim();
  return joined ? joined.split(/\s+/).length : 0;
}
