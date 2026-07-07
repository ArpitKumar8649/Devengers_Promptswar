"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  loadComplaints,
  seedIfEmpty,
  advanceStatus,
  newTrackingId,
  upsertComplaints,
  STATUS_ORDER,
} from "@/lib/store";
import type { Complaint, ComplaintStatus, Severity } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { pullComplaintsFromCloud } from "@/lib/sync";
import {
  MapPin,
  Trash2,
  CheckCircle2,
  Circle,
  Clock,
  FastForward,
  Inbox,
  Building2,
} from "lucide-react";

const SEVERITY_COLORS: Record<Severity, string> = {
  1: "bg-emerald-400",
  2: "bg-lime-400",
  3: "bg-yellow-400",
  4: "bg-orange-400",
  5: "bg-red-500",
};

const SEVERITY_LABEL: Record<Severity, string> = {
  1: "Low",
  2: "Minor",
  3: "Moderate",
  4: "High",
  5: "Critical",
};

function buildSeed(): Complaint[] {
  const now = Date.now();
  return [
    {
      id: newTrackingId(),
      issueType: "Broken Road / Pothole",
      department: "Roads & Infrastructure",
      authorityName: "Chennai Corporation",
      severity: 4,
      summary:
        "Large pothole on the main road near the bus stop causing traffic and risk to two-wheelers.",
      status: "In Progress",
      createdAt: now - 1000 * 60 * 60 * 26,
      language: "English",
    },
    {
      id: newTrackingId(),
      issueType: "Overflowing Garbage",
      department: "Solid Waste Management",
      authorityName: "Ward 112 Sanitation Office",
      severity: 3,
      summary:
        "Garbage bin overflowing for several days, foul smell and stray animals around the area.",
      status: "Acknowledged",
      createdAt: now - 1000 * 60 * 60 * 5,
      language: "English",
    },
  ];
}

function iconForIssue(issueType: string) {
  const t = issueType.toLowerCase();
  if (t.includes("garbage") || t.includes("waste") || t.includes("trash")) {
    return Trash2;
  }
  return MapPin;
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / (1000 * 60));
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

function StatusTimeline({ status }: { status: ComplaintStatus }) {
  const currentIndex = STATUS_ORDER.indexOf(status);
  const resolved = status === "Resolved";

  return (
    <div className="flex items-center">
      {STATUS_ORDER.map((step, i) => {
        const reached = i <= currentIndex;
        const isLast = i === STATUS_ORDER.length - 1;
        const dotColor = reached
          ? resolved
            ? "bg-indiagreen border-indiagreen text-white"
            : "bg-saffron border-saffron text-ink"
          : "border-white/20 text-white/30 bg-white/5";
        const connectorColor =
          i < currentIndex
            ? resolved
              ? "bg-indiagreen"
              : "bg-saffron"
            : "bg-white/10";

        return (
          <div
            key={step}
            className={cn("flex flex-col items-center", !isLast && "flex-1")}
          >
            <div className="flex w-full items-center">
              <div
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                  dotColor
                )}
              >
                {reached ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <Circle className="h-3 w-3" />
                )}
              </div>
              {!isLast && (
                <div
                  className={cn(
                    "h-0.5 flex-1 transition-colors",
                    connectorColor
                  )}
                />
              )}
            </div>
            <span
              className={cn(
                "mt-2 max-w-[4.5rem] text-center text-[11px] leading-tight",
                reached ? "text-white/90" : "text-white/40"
              )}
            >
              {step}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function TrackPage() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [mounted, setMounted] = useState(false);

  const refresh = useCallback(() => {
    setComplaints(loadComplaints());
  }, []);

  useEffect(() => {
    seedIfEmpty(buildSeed());
    refresh();
    setMounted(true);
  }, [refresh]);

  // When signed in, merge any cloud-synced complaints into the local list.
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    pullComplaintsFromCloud(user).then((cloud) => {
      if (!cancelled && cloud.length) {
        upsertComplaints(cloud);
        refresh();
      }
    });
    return () => {
      cancelled = true;
    };
  }, [user, refresh]);

  useEffect(() => {
    if (!mounted) return;
    const timer = setInterval(() => {
      const current = loadComplaints();
      const target = current
        .slice()
        .sort((a, b) => b.createdAt - a.createdAt)
        .find((c) => c.status !== "Resolved");
      if (target) {
        advanceStatus(target.id);
        refresh();
      }
    }, 8000);
    return () => clearInterval(timer);
  }, [mounted, refresh]);

  const handleAdvance = useCallback(
    (id: string) => {
      advanceStatus(id);
      refresh();
    },
    [refresh]
  );

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <header className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-white">
          <Clock className="h-6 w-6 text-saffron" />
          My Complaints
        </h1>
        <p className="mt-1 text-sm text-white/60">
          Track the status of your filed complaints in real time.
        </p>
      </header>

      {!mounted ? (
        <div className="space-y-4">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="h-48 animate-pulse rounded-3xl border border-white/10 bg-white/5"
            />
          ))}
        </div>
      ) : complaints.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/5 px-6 py-16 text-center backdrop-blur">
          <Inbox className="h-12 w-12 text-white/30" />
          <h2 className="mt-4 text-lg font-semibold text-white">
            No complaints yet
          </h2>
          <p className="mt-1 max-w-xs text-sm text-white/60">
            When you file a complaint, it will appear here so you can track its
            progress.
          </p>
          <Link
            href="/report"
            className="mt-6 rounded-2xl bg-saffron px-5 py-3 font-semibold text-ink"
          >
            File a complaint
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {complaints
            .slice()
            .sort((a, b) => b.createdAt - a.createdAt)
            .map((c) => {
              const Icon = iconForIssue(c.issueType);
              const isResolved = c.status === "Resolved";
              return (
                <article
                  key={c.id}
                  className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/5 text-saffron">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h2 className="text-base font-semibold leading-tight text-white">
                          {c.issueType}
                        </h2>
                        <p className="mt-1 flex items-center gap-1.5 text-xs text-white/60">
                          <Building2 className="h-3.5 w-3.5" />
                          {c.department} · {c.authorityName}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="font-mono text-sm font-bold tracking-wide text-saffron">
                        {c.id}
                      </span>
                      <span className="text-[11px] text-white/40">
                        {timeAgo(c.createdAt)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <span
                      className={cn(
                        "inline-block h-2.5 w-2.5 rounded-full",
                        SEVERITY_COLORS[c.severity]
                      )}
                    />
                    <span className="text-xs text-white/60">
                      Severity {c.severity} · {SEVERITY_LABEL[c.severity]}
                    </span>
                  </div>

                  {c.summary && (
                    <p className="mt-3 line-clamp-2 text-sm text-white/70">
                      {c.summary}
                    </p>
                  )}

                  <div className="mt-5 rounded-2xl border border-white/10 bg-ink/40 p-4">
                    <StatusTimeline status={c.status} />
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <span
                      className={cn(
                        "rounded-full px-3 py-1 text-xs font-semibold",
                        isResolved
                          ? "bg-indiagreen/20 text-indiagreen"
                          : "bg-saffron/20 text-saffron"
                      )}
                    >
                      {c.status}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleAdvance(c.id)}
                      disabled={isResolved}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-2xl px-3 py-2 text-xs font-medium transition-colors",
                        isResolved
                          ? "cursor-not-allowed bg-white/5 text-white/30"
                          : "bg-white/10 text-white/80 hover:bg-white/20"
                      )}
                    >
                      <FastForward className="h-3.5 w-3.5" />
                      {isResolved ? "Completed" : "Advance status"}
                    </button>
                  </div>
                </article>
              );
            })}
        </div>
      )}
    </main>
  );
}