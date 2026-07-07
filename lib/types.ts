// Shared domain types for Smart Bharat.

export type Severity = 1 | 2 | 3 | 4 | 5;

export type ComplaintStatus =
  | "Filed"
  | "Acknowledged"
  | "In Progress"
  | "Resolved";

/** Result of the /api/vision report mode (Samasya). */
export type IssueAnalysis = {
  issueType: string; // "Broken Road / Pothole"
  severity: Severity; // 1..5
  severityReason: string; // why this severity (public-safety rationale)
  department: string; // "Roads & Infrastructure"
  authorityName: string; // "Greater Chennai Corporation"
  whatISee: string; // proof the model understood the image
  complaintEnglish: string; // formal complaint letter (English)
  complaintLocal: string; // same letter in the citizen's language
};

/** Result of the /api/vision document mode (Kaagaz). */
export type DocAnalysis = {
  documentType: string;
  verdict: "GOOD" | "CAUTION" | "ACTION_NEEDED";
  plainSummary: string; // plain-language explanation in user's language
  actionNeeded: string; // what the citizen must do (or "None")
  deadline: string | null;
  office: string | null;
  requiredDocuments: string[];
};

/** One matched scheme from /api/match (Yojana). */
export type MatchedScheme = {
  name: string;
  benefitAmount: string; // "₹6,000 / year"
  reason: string; // why they qualify
  documentsNeeded: string[];
  department: string;
};

/** A tracked complaint (persisted in localStorage). */
export type Complaint = {
  id: string; // "SB-4821"
  issueType: string;
  department: string;
  authorityName: string;
  severity: Severity;
  summary: string;
  status: ComplaintStatus;
  createdAt: number; // epoch ms
  language: string;
};

/** Seed scheme record (data/schemes.json). */
export type SeedScheme = {
  name: string;
  category: string;
  benefit: string;
  eligibility: string;
  documents: string[];
  department: string;
};

/** Seed department record (data/departments.json). */
export type SeedDepartment = {
  department: string;
  handles: string[];
  authorityByCity: Record<string, string>;
};
