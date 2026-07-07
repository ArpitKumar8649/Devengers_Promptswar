import departments from "@/data/departments.json";
import type {
  IssueAnalysis,
  DocAnalysis,
  MatchedScheme,
  Severity,
  SeedDepartment,
} from "@/lib/types";

const DEPTS = departments as SeedDepartment[];

/** Clamp any model output to a valid 1-5 severity (defaults to 3 on garbage). */
export function clampSeverity(v: unknown): Severity {
  const n = Math.round(Number(v));
  if (!Number.isFinite(n)) return 3;
  return Math.min(5, Math.max(1, n)) as Severity;
}

/** Coerce an unknown value to a string, with a fallback for non-strings. */
export function str(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

/** Coerce an unknown value to a clean string array. */
export function strArray(v: unknown): string[] {
  if (Array.isArray(v)) return v.map((x) => String(x)).filter(Boolean);
  if (typeof v === "string" && v.trim()) return [v];
  return [];
}

/** Ground the authority against curated per-city data instead of trusting the model. */
export function resolveAuthority(
  department: string,
  city: string,
  modelGuess: string,
): string {
  const dept = DEPTS.find((d) => d.department === department);
  if (dept) {
    return dept.authorityByCity[city] ?? dept.authorityByCity["Default"] ?? modelGuess;
  }
  return modelGuess || "Local Municipal Corporation";
}

/** Normalize a (possibly malformed) vision "report" result into a safe IssueAnalysis. */
export function normalizeIssue(raw: Record<string, unknown>, city: string): IssueAnalysis {
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

/** Normalize a (possibly malformed) vision "document" result into a safe DocAnalysis. */
export function normalizeDoc(raw: Record<string, unknown>): DocAnalysis {
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

/** Coerce a single (possibly malformed) LLM scheme item into a safe MatchedScheme, or null. */
export function normalizeScheme(x: unknown): MatchedScheme | null {
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

/** Normalize a full match response's scheme array. */
export function normalizeSchemes(rawList: unknown): MatchedScheme[] {
  if (!Array.isArray(rawList)) return [];
  return rawList
    .map(normalizeScheme)
    .filter((s): s is MatchedScheme => s !== null);
}
