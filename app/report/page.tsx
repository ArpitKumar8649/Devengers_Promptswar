"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  Camera,
  ImageIcon,
  Loader2,
  Copy,
  Download,
  Check,
  AlertTriangle,
  MapPin,
  Building2,
  Eye,
  Sparkles,
  Ticket,
  ArrowRight,
  RotateCcw,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { fileToResizedDataUrl } from "@/lib/image";
import type { IssueAnalysis, Severity, Complaint } from "@/lib/types";
import { saveComplaint, newTrackingId } from "@/lib/store";

function severityStyle(sev: Severity) {
  if (sev <= 2)
    return {
      badge: "bg-indiagreen/20 text-indiagreen border-indiagreen/40",
      ring: "ring-indiagreen/30",
      label: "Low",
    };
  if (sev === 3)
    return {
      badge: "bg-amber-400/15 text-amber-300 border-amber-400/40",
      ring: "ring-amber-400/30",
      label: "Moderate",
    };
  return {
    badge: "bg-red-500/15 text-red-300 border-red-500/40",
    ring: "ring-red-500/30",
    label: "Urgent",
  };
}

export default function ReportPage() {
  const { lang } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingSample, setLoadingSample] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<IssueAnalysis | null>(null);
  const [trackingId, setTrackingId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showEnglish, setShowEnglish] = useState(false);
  const [city, setCity] = useState("Chennai");

  function reset() {
    setFile(null);
    setPreviewUrl(null);
    setResult(null);
    setTrackingId(null);
    setError(null);
    setCopied(false);
    setShowEnglish(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setResult(null);
    setTrackingId(null);
    setError(null);
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
  }

  async function useSample() {
    setError(null);
    setResult(null);
    setTrackingId(null);
    setLoadingSample(true);
    try {
      const res = await fetch("/sample-pothole.jpg");
      if (!res.ok) throw new Error("sample fetch failed");
      const blob = await res.blob();
      const sampleFile = new File([blob], "s.jpg", { type: blob.type || "image/jpeg" });
      setFile(sampleFile);
      setPreviewUrl("/sample-pothole.jpg");
    } catch {
      setError("Could not load the sample photo. Please upload your own image.");
    } finally {
      setLoadingSample(false);
    }
  }

  async function analyze() {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setTrackingId(null);
    try {
      const dataUrl = await fileToResizedDataUrl(file);
      const res = await fetch("/api/vision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: dataUrl,
          mode: "report",
          language: lang.name,
          city,
        }),
      });
      if (!res.ok) {
        let msg = "Saathi couldn't analyse this photo. Please try again.";
        try {
          const data = (await res.json()) as { error?: string };
          if (data?.error) msg = data.error;
        } catch {
          /* ignore */
        }
        throw new Error(msg);
      }
      const analysis = (await res.json()) as IssueAnalysis;
      setResult(analysis);

      const id = newTrackingId();
      const complaint: Complaint = {
        id,
        issueType: analysis.issueType,
        department: analysis.department,
        authorityName: analysis.authorityName,
        severity: analysis.severity,
        summary: analysis.whatISee,
        status: "Filed",
        createdAt: Date.now(),
        language: lang.name,
      };
      saveComplaint(complaint);
      setTrackingId(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function complaintText() {
    if (!result) return "";
    return `${result.complaintLocal}\n\n----------\n\n${result.complaintEnglish}`;
  }

  async function copyComplaint() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(complaintText());
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setError("Couldn't copy. You can select the text manually.");
    }
  }

  function downloadComplaint() {
    if (!result) return;
    const header = trackingId ? `Tracking ID: ${trackingId}\n\n` : "";
    const blob = new Blob([header + complaintText()], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `complaint-${trackingId ?? "saathi"}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  const sev = result ? severityStyle(result.severity) : null;

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <header className="mb-6">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60">
          <Sparkles className="h-3.5 w-3.5 text-saffron" />
          Samasya · Report a Public Issue
        </div>
        <h1 className="text-3xl font-bold text-white">Snap it. Saathi files it.</h1>
        <p className="mt-1 text-white/60">
          Take a photo of the problem. Saathi writes and routes the complaint for you.
        </p>
      </header>

      {/* Upload card */}
      <section className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={onPick}
        />

        {!previewUrl ? (
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-saffron/15">
              <Camera className="h-8 w-8 text-saffron" />
            </div>
            <div>
              <p className="font-semibold text-white">Take or upload a photo</p>
              <p className="text-sm text-white/60">Pothole, garbage, broken light… anything.</p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-saffron px-5 py-3 font-semibold text-ink transition active:scale-[0.98]"
              >
                <Camera className="h-5 w-5" />
                Take / Upload Photo
              </button>
              <button
                onClick={useSample}
                disabled={loadingSample}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-5 py-3 font-semibold text-white transition active:scale-[0.98] disabled:opacity-60"
              >
                {loadingSample ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <ImageIcon className="h-5 w-5" />
                )}
                Use sample photo
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="relative overflow-hidden rounded-2xl border border-white/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="Selected issue"
                className="max-h-80 w-full object-cover"
              />
            </div>
            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5">
              <MapPin className="h-4 w-4 shrink-0 text-saffron" />
              <label htmlFor="city" className="text-sm text-white/60">
                Your city
              </label>
              <select
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="ml-auto rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white outline-none focus:ring-2 focus:ring-saffron/40"
              >
                {["Chennai", "Mumbai", "Delhi", "Bengaluru", "Other"].map((c) => (
                  <option key={c} value={c === "Other" ? "Default" : c} className="bg-ink">
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={analyze}
                disabled={loading}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-saffron px-5 py-3 font-semibold text-ink transition active:scale-[0.98] disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Analysing…
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    Analyse &amp; File Complaint
                  </>
                )}
              </button>
              <button
                onClick={reset}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-5 py-3 font-semibold text-white transition active:scale-[0.98] disabled:opacity-60"
              >
                <RotateCcw className="h-5 w-5" />
                Change
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Loading state */}
      {loading && (
        <section className="mt-6 flex flex-col items-center gap-3 rounded-3xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur">
          <Loader2 className="h-8 w-8 animate-spin text-saffron" />
          <p className="font-semibold text-white">Saathi is analysing your photo…</p>
          <p className="text-sm text-white/60">Detecting the issue, severity and the right authority.</p>
        </section>
      )}

      {/* Error state */}
      {error && !loading && (
        <section className="mt-6 flex items-start gap-3 rounded-3xl border border-red-500/30 bg-red-500/10 p-5 backdrop-blur">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-300" />
          <div>
            <p className="font-semibold text-white">Something went wrong</p>
            <p className="text-sm text-white/70">{error}</p>
          </div>
        </section>
      )}

      {/* Result */}
      {result && sev && !loading && (
        <section className="mt-6 space-y-5">
          {/* Tracking banner */}
          {trackingId && (
            <div className="flex flex-col items-start justify-between gap-3 rounded-3xl border border-indiagreen/40 bg-indiagreen/10 p-5 backdrop-blur sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indiagreen/20">
                  <Ticket className="h-6 w-6 text-indiagreen" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-white/60">Complaint filed</p>
                  <p className="text-2xl font-bold text-white">{trackingId}</p>
                </div>
              </div>
              <Link
                href="/track"
                className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-2.5 font-semibold text-white transition hover:bg-white/15 active:scale-[0.98]"
              >
                Track status
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}

          {/* Analysis card */}
          <div className={cn("rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur ring-1", sev.ring)}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-white/50">Issue detected</p>
                <h2 className="text-2xl font-bold text-white">{result.issueType}</h2>
              </div>
              <div
                className={cn(
                  "flex shrink-0 flex-col items-center rounded-2xl border px-4 py-2 text-center",
                  sev.badge,
                )}
              >
                <span className="text-2xl font-black leading-none">{result.severity}</span>
                <span className="text-[10px] font-semibold uppercase tracking-wide">{sev.label}</span>
              </div>
            </div>

            <p className="mt-2 text-sm text-white/70">{result.severityReason}</p>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/80">
                <Building2 className="h-4 w-4 text-saffron" />
                {result.department}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/80">
                <MapPin className="h-4 w-4 text-saffron" />
                {result.authorityName}
              </span>
            </div>

            <div className="mt-4 flex items-start gap-2 rounded-2xl border border-white/10 bg-white/5 p-3">
              <Eye className="mt-0.5 h-4 w-4 shrink-0 text-white/50" />
              <p className="text-sm text-white/80">
                <span className="text-white/50">What Saathi sees: </span>
                {result.whatISee}
              </p>
            </div>
          </div>

          {/* Complaint letter */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="font-semibold text-white">Complaint letter</h3>
              <div className="inline-flex rounded-xl border border-white/10 bg-white/5 p-0.5 text-xs">
                <button
                  onClick={() => setShowEnglish(false)}
                  className={cn(
                    "rounded-lg px-3 py-1.5 font-medium transition",
                    !showEnglish ? "bg-saffron text-ink" : "text-white/60",
                  )}
                >
                  {lang.label}
                </button>
                <button
                  onClick={() => setShowEnglish(true)}
                  className={cn(
                    "rounded-lg px-3 py-1.5 font-medium transition",
                    showEnglish ? "bg-saffron text-ink" : "text-white/60",
                  )}
                >
                  English
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-ink/40 p-4">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-white/90">
                {showEnglish ? result.complaintEnglish : result.complaintLocal}
              </p>
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={copyComplaint}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-saffron px-4 py-3 font-semibold text-ink transition active:scale-[0.98]"
              >
                {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                {copied ? "Copied!" : "Copy"}
              </button>
              <button
                onClick={downloadComplaint}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-4 py-3 font-semibold text-white transition active:scale-[0.98]"
              >
                <Download className="h-5 w-5" />
                Download .txt
              </button>
            </div>
          </div>

          <button
            onClick={reset}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-semibold text-white/80 transition hover:bg-white/10 active:scale-[0.98]"
          >
            <RotateCcw className="h-5 w-5" />
            Report another issue
          </button>
        </section>
      )}
    </main>
  );
}
