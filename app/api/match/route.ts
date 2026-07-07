import { NextRequest, NextResponse } from "next/server";
import { qwenJSON } from "@/lib/qwen";
import schemes from "@/data/schemes.json";
import type { MatchedScheme } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120; // deep-reasoning (enable_thinking) can take ~1 min

type MatchResult = { matchedSchemes: MatchedScheme[] };

/** Coerce a single (possibly malformed) LLM item into a safe MatchedScheme. */
function normalizeScheme(x: unknown): MatchedScheme | null {
  if (!x || typeof x !== "object") return null;
  const o = x as Record<string, unknown>;
  const name = typeof o.name === "string" ? o.name : "";
  if (!name) return null;
  const docs = Array.isArray(o.documentsNeeded)
    ? o.documentsNeeded.map((d) => String(d)).filter(Boolean)
    : typeof o.documentsNeeded === "string" && o.documentsNeeded.trim()
      ? [o.documentsNeeded]
      : [];
  return {
    name,
    benefitAmount: typeof o.benefitAmount === "string" ? o.benefitAmount : "",
    reason: typeof o.reason === "string" ? o.reason : "",
    documentsNeeded: docs,
    department: typeof o.department === "string" ? o.department : "",
  };
}

export async function POST(req: NextRequest) {
  const { profile, language, think } = (await req.json()) as {
    profile?: string;
    language?: string;
    think?: boolean;
  };

  if (!profile || !profile.trim()) {
    return NextResponse.json({ error: "No profile provided." }, { status: 400 });
  }
  if (!process.env.DASHSCOPE_API_KEY) {
    return NextResponse.json(
      { error: "DASHSCOPE_API_KEY is not set on the server." },
      { status: 500 },
    );
  }

  const lang = language || "English";

  const system = `You are "Saathi", an expert on Indian government welfare schemes. Given a citizen's short life description, decide which schemes from the provided list they most likely qualify for. Use fuzzy, humane reasoning (e.g. "no land + low income" → landless labourer categories). NEVER invent schemes outside the list. Reply ONLY with valid JSON.`;

  const user = `Here is the list of available schemes (JSON):
${JSON.stringify(schemes)}

Citizen's description: "${profile}"

Return ONLY JSON exactly matching this shape:
{
  "matchedSchemes": [
    {
      "name": "exact scheme name from the list",
      "benefitAmount": "the benefit, from the list",
      "reason": "one short line, in ${lang}, why this citizen likely qualifies",
      "documentsNeeded": ["documents from the list, in ${lang}"],
      "department": "the department from the list"
    }
  ]
}
Rank the most relevant schemes first. Include only genuinely plausible matches (max 5). Write "reason" and "documentsNeeded" in ${lang}. If nothing plausibly matches, return an empty array. JSON only.`;

  const raw = await qwenJSON<{ matchedSchemes?: unknown[] }>({
    system,
    user,
    think: think === true,
  });
  if (raw === null) {
    return NextResponse.json(
      { error: "Saathi could not check schemes right now. Please try again." },
      { status: 502 },
    );
  }
  const matchedSchemes = Array.isArray(raw.matchedSchemes)
    ? raw.matchedSchemes.map(normalizeScheme).filter((s): s is MatchedScheme => s !== null)
    : [];
  return NextResponse.json({ matchedSchemes } satisfies MatchResult);
}
