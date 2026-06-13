import { NextRequest, NextResponse } from "next/server";
import {
  OPEN_MODE_QUESTIONS,
  SANDBOX_QUESTIONS,
  type SandboxDirection,
} from "@/lib/sandbox/sandboxQuestions";

const SYSTEM_PROMPT = `You are the Muse — a quiet reader who helps a person see their own life-book more clearly. You never advise, conclude, coach, or write your own words to the user.

Your only task right now: from the numbered list of questions below, choose the single one most worth offering this person in this moment. You are SELECTING, not writing. Respond with ONLY the number of the chosen question — no other text.

You may never invent a question, modify a question, or return anything except one number from the list.`;

type MuseDirection = SandboxDirection | "open";

const VALID_DIRECTIONS = new Set<string>([
  "open",
  "understand_myself",
  "explore_past",
  "find_patterns",
  "continue_writing",
  "strengthen_future",
  "surprise_me",
]);

function poolFor(direction: MuseDirection): string[] {
  return direction === "open"
    ? OPEN_MODE_QUESTIONS
    : SANDBOX_QUESTIONS[direction];
}

function randomFromPool(pool: string[]): string {
  return pool[Math.floor(Math.random() * pool.length)] ?? pool[0];
}

function parseDirection(raw: unknown): MuseDirection {
  if (typeof raw === "string" && VALID_DIRECTIONS.has(raw)) {
    return raw as MuseDirection;
  }
  return "open";
}

async function selectWithClaude(
  pool: string[],
  context: { sectionTitle?: string; mode?: string; direction: MuseDirection }
): Promise<number | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  const model = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";
  const numbered = pool.map((q, i) => `${i + 1}. ${q}`).join("\n");

  const contextLines: string[] = [];
  if (context.sectionTitle) {
    contextLines.push(`Section: ${context.sectionTitle}`);
  }
  if (context.mode) {
    contextLines.push(`Muse mode: ${context.mode}`);
  }
  contextLines.push(`Direction: ${context.direction}`);

  const userMessage = `${contextLines.join("\n")}\n\nQuestions:\n${numbered}`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model,
      max_tokens: 20,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    }),
  });

  if (!res.ok) return null;

  const data = (await res.json()) as {
    content?: { type: string; text?: string }[];
  };
  const text = data.content?.find((block) => block.type === "text")?.text ?? "";
  const match = text.trim().match(/(\d+)/);
  if (!match) return null;

  const n = parseInt(match[1], 10);
  if (n < 1 || n > pool.length) return null;
  return n - 1;
}

export async function POST(req: NextRequest) {
  let direction: MuseDirection = "open";

  try {
    const body = (await req.json()) as {
      direction?: unknown;
      sectionTitle?: string;
      mode?: string;
    };

    direction = parseDirection(body.direction);
    const pool = poolFor(direction);

    const index = await selectWithClaude(pool, {
      sectionTitle: body.sectionTitle,
      mode: body.mode,
      direction,
    });

    const question =
      index !== null ? pool[index] : randomFromPool(pool);

    return NextResponse.json({ question });
  } catch {
    return NextResponse.json({
      question: randomFromPool(poolFor(direction)),
    });
  }
}
