import { NextRequest, NextResponse } from "next/server";
import { qwenVisionJSON } from "@/lib/qwen";
import departments from "@/data/departments.json";
import type { IssueAnalysis, DocAnalysis, Severity, SeedDepartment } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const DEPTS = departments as SeedDepartment[];
const DEPT_LIST = DEPTS.map(
  (d) => `- ${d.department}: handles ${d.handles.join(", ")}`,
).join("\n");

function clampSeverity(v: unknown): Severity {
  const n = Math.round(Number(v));
  if (!Number.isFinite(n)) return 3;
  return Math.min(5, Math.max(1, n)) as Severity;
}

function str(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

function strArray(v: unknown): string[] {
  if (Array.isArray(v)) return v.map((x) => String(x)).filter(Boolean);
  if (typeof v === "string" && v.trim()) return [v];
  return [];
}

/** Ground the authority against curated per-city data instead of trusting the model. */
function resolveAuthority(department: string, city: string, modelGuess: string): string {
  const dept = DEPTS.find((d) => d.department === department);
  if (dept) {
    return dept.authorityByCity[city] ?? dept.authorityByCity["Default"] ?? modelGuess;
  }
  return modelGuess || "Local Municipal Corporation";
}

function normalizeIssue(raw: Record<string, unknown>, city: string): IssueAnalysis {
  const department = str(raw.department, "Municipal Corporation");
  const complaintEnglish = str(
    raw.complaintEnglish,
    "Respected Sir/Madam, I would like to report a civic issue in my area that requires attention. Kindly take necessary action. Thank you.",
  );
  return {
    issueType: str(raw.issueType, "Civic Issue"),
    severity: clampSeverity(raw.severity),
    severityReason: str(raw.severityReason, "Requires attention from the concerned department."),
    department,
    authorityName: resolveAuthority(department, city, str(raw.authorityName)),
    whatISee: str(raw.whatISee, "A civic issue is visible in the image."),
    complaintEnglish,
    // Never leave the local letter blank — fall back to English.
    complaintLocal: str(raw.complaintLocal) || complaintEnglish,
  };
}

function normalizeDoc(raw: Record<string, unknown>): DocAnalysis {
  const verdict = ["GOOD", "CAUTION", "ACTION_NEEDED"].includes(String(raw.verdict))
    ? (raw.verdict as DocAnalysis["verdict"])
    : "CAUTION";
  return {
    documentType: str(raw.documentType, "Government Document"),
    verdict,
    plainSummary: str(raw.plainSummary, "We could not fully read this document. Please try a clearer photo."),
    actionNeeded: str(raw.actionNeeded, "None"),
    deadline: raw.deadline ? String(raw.deadline) : null,
    office: raw.office ? String(raw.office) : null,
    requiredDocuments: strArray(raw.requiredDocuments),
  };
}

export async function POST(req: NextRequest) {
  let body: { image?: string; mode?: "report" | "document"; language?: string; city?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { image, mode, language, city } = body;
  if (!image) {
    return NextResponse.json({ error: "No image provided." }, { status: 400 });
  }
  if (!process.env.DASHSCOPE_API_KEY) {
    return NextResponse.json({ error: "DASHSCOPE_API_KEY is not set on the server." }, { status: 500 });
  }

  const lang = language || "English";
  const cityName = city || "Default";

  if (mode === "document") {
    const system = `You are "Saathi", a calm, trustworthy civic helper for Indian citizens who may not read well and may fear official paper. You read a government document and explain it simply. NEVER invent a deadline, office, or document not visible in the image. Reply ONLY with valid JSON.`;
    const instruction = `Read this Indian government document/letter/notice. Return ONLY JSON exactly matching this shape:
{
  "documentType": "short name of the document",
  "verdict": "GOOD | CAUTION | ACTION_NEEDED",
  "plainSummary": "a warm, very simple explanation of what this paper is and means, in ${lang}",
  "actionNeeded": "what the citizen must do next, in ${lang}. Use exactly the word None (in English) if nothing is needed",
  "deadline": "the deadline if any, else null",
  "office": "the office to visit if any, else null",
  "requiredDocuments": ["documents the citizen must carry, in ${lang}, if any"]
}
Write plainSummary in ${lang}. Be honest and reassuring. JSON only.`;

    const raw = await qwenVisionJSON<Record<string, unknown>>({ system, instruction, imageDataUrl: image });
    if (raw === null) {
      return NextResponse.json({ error: "Saathi could not read the document. Please try again." }, { status: 502 });
    }
    return NextResponse.json(normalizeDoc(raw));
  }

  // Default: report mode
  const system = `You are "Saathi", an AI municipal grievance officer for Indian cities. You look at a photo of a civic problem and produce a filed-ready complaint. Reply ONLY with valid JSON.`;
  const instruction = `Analyse this photo of a civic issue in an Indian city (${cityName}). Choose the single most appropriate department from this list:
${DEPT_LIST}

Return ONLY JSON exactly matching this shape:
{
  "issueType": "short issue name, e.g. 'Broken Road / Pothole'",
  "severity": 1,
  "severityReason": "one line public-safety rationale for the severity (1=cosmetic, 5=life-threatening)",
  "department": "the chosen department name EXACTLY as written in the list",
  "authorityName": "the responsible municipal authority",
  "whatISee": "one specific sentence describing what is visible, to prove you saw the image",
  "complaintEnglish": "a formal, polite complaint letter in English (4-6 sentences) describing the issue and requesting action",
  "complaintLocal": "the SAME complaint letter written in ${lang}"
}
severity must be an integer 1-5. Write complaintLocal in ${lang}. JSON only.`;

  const raw = await qwenVisionJSON<Record<string, unknown>>({ system, instruction, imageDataUrl: image });
  if (raw === null) {
    return NextResponse.json({ error: "Saathi could not analyse the photo. Please try again." }, { status: 502 });
  }
  return NextResponse.json(normalizeIssue(raw, cityName));
}
