"use client";

import type { Complaint, ComplaintStatus } from "./types";

const KEY = "sb_complaints";

const STATUS_ORDER: ComplaintStatus[] = [
  "Filed",
  "Acknowledged",
  "In Progress",
  "Resolved",
];

export function newTrackingId(): string {
  const existing = new Set(loadComplaints().map((c) => c.id));
  // Try random 4-digit ids, then fall back to a time-based suffix to guarantee uniqueness.
  for (let i = 0; i < 20; i++) {
    const id = "SB-" + Math.floor(1000 + Math.random() * 9000);
    if (!existing.has(id)) return id;
  }
  return "SB-" + Date.now().toString().slice(-6);
}

export function loadComplaints(): Complaint[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]") as Complaint[];
  } catch {
    return [];
  }
}

export function saveComplaint(c: Complaint) {
  const all = loadComplaints();
  all.unshift(c);
  localStorage.setItem(KEY, JSON.stringify(all));
}

/** Advance a complaint one step along the status timeline (demo "aliveness"). */
export function advanceStatus(id: string) {
  const all = loadComplaints();
  const c = all.find((x) => x.id === id);
  if (!c) return;
  const i = STATUS_ORDER.indexOf(c.status);
  if (i < STATUS_ORDER.length - 1) c.status = STATUS_ORDER[i + 1];
  localStorage.setItem(KEY, JSON.stringify(all));
}

export function seedIfEmpty(seed: Complaint[]) {
  if (loadComplaints().length === 0) {
    localStorage.setItem(KEY, JSON.stringify(seed));
  }
}

export { STATUS_ORDER };
