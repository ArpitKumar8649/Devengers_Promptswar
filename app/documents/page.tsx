"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import {
  Upload,
  FileText,
  Volume2,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  CalendarClock,
  Building2,
  ClipboardList,
  ArrowLeft,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { fileToResizedDataUrl } from "@/lib/image";
import type { DocAnalysis } from "@/lib/types";

type VerdictKey = DocAnalysis["verdict"];

const VERDICT_META: Record<
  VerdictKey,
  { emoji: string; label: string; line: string; ring: string; text: string; glow: string }
> = {
  GOOD: {
    emoji: "🟢",
    label: "All good",
    line: "Nothing to worry about. This is normal paperwork.",
    ring: "border-indiagreen/40 bg-indiagreen/10",
    text: "text-indiagreen",
    glow: "shadow-[0_0_40px_-10px_rgba(19,136,8,0.6)]",
  },
  CAUTION: {
    emoji: "🟡",
    label: "Read carefully",
    line: "No emergency — just a few things worth knowing.",
    ring: "border-saffron/40 bg-saffron/10",
    text: "text-saffron",
    glow: "shadow-[0_0_40px_-10px_rgba(255,153,51,0.6)]",
  },
  ACTION_NEEDED: {
    emoji: "🔴",
    label: "Action needed",
    line: "You have something to do — but Saathi will guide you. Stay calm.",
    ring: "border-red-500/40 bg-red-500/10",
    text: "text-red-400",
    glow: "shadow-[0_0_40px_-10px_rgba(239,68,68,0.6)]",
  },
};

export default function DocumentsPage() {
  const { lang } = useLanguage();

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DocAnalysis | null>(null);
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const [speaking, setSpeaking] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const onPick = useCallback((f: File | null) => {
    if (!f) return;
    setFile(f);
    setResult(null);
    setError(null);
    setChecked({});
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(f);
    });
  }, []);

  const reset = useCallback(() => {
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setFile(null);
    setResult(null);
    setError(null);
    setChecked({});
    if (inputRef.current) inputRef.current.value = "";
    try {
      window.speechSynthesis?.cancel();
    } catch {
      /* ignore */
    }
    setSpeaking(false);
  }, []);

  const explain = useCallback(async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const dataUrl = await fileToResizedDataUrl(file);
      const res = await fetch("/api/vision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: dataUrl, mode: "document", language: lang.name }),
      });
      if (!res.ok) {
        let msg = "Saathi could not read this document.";
        try {
          const j = (await res.json()) as { error?: string };
          if (j?.error) msg = j.error;
        } catch {
          /* ignore */
        }
        throw new Error(msg);
      }
      const data = (await res.json()) as DocAnalysis;
      setResult(data);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Something went wrong. Please try again with a clearer photo."
      );
    } finally {
      setLoading(false);
    }
  }, [file, lang.name]);

  const readAloud = useCallback(() => {
    if (!result) return;
    try {
      const synth = window.speechSynthesis;
      if (!synth || typeof SpeechSynthesisUtterance === "undefined") return;

      if (speaking) {
        synth.cancel();
        setSpeaking(false);
        return;
      }

      const utter = new SpeechSynthesisUtterance(result.plainSummary);
      const voices = synth.getVoices();
      const match = voices.find(
        (v) =>
          v.lang?.toLowerCase().startsWith(lang.code.toLowerCase()) ||
          v.lang?.toLowerCase().split("-")[0] === lang.code.toLowerCase()
      );
      if (match) utter.voice = match;
      utter.rate = 0.95;
      utter.onend = () => setSpeaking(false);
      utter.onerror = () => setSpeaking(false);
      synth.cancel();
      synth.speak(utter);
      setSpeaking(true);
    } catch {
      setSpeaking(false);
    }
  }, [result, speaking, lang.code]);

  const hasAction =
    !!result && result.actionNeeded && result.actionNeeded.trim().toLowerCase() !== "none";

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <span className="grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-white/5">
          <FileText className="h-6 w-6 text-saffron" />
        </span>
        <div>
          <h1 className="text-2xl font-bold text-white">Kaagaz</h1>
          <p className="text-sm text-white/60">Understand any official letter — no fear.</p>
        </div>
      </div>

      {/* Reassurance banner */}
      <div className="mb-6 flex items-start gap-3 rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-indiagreen" />
        <p className="text-sm text-white/70">
          Got a government notice you don&apos;t understand? Take a photo. Saathi will explain it in
          simple {lang.label}, tell you if anything needs doing, and stay by your side.
        </p>
      </div>

      {/* Upload card */}
      <section className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => onPick(e.target.files?.[0] ?? null)}
        />

        {!previewUrl ? (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-white/15 bg-white/5 px-6 py-12 text-center transition hover:border-saffron/50 hover:bg-white/[0.07]"
          >
            <span className="grid h-16 w-16 place-items-center rounded-full bg-saffron/15">
              <Upload className="h-7 w-7 text-saffron" />
            </span>
            <span className="text-lg font-semibold text-white">Take a photo of your document</span>
            <span className="text-sm text-white/50">
              Letters, notices, bills — anything on official paper
            </span>
          </button>
        ) : (
          <div className="space-y-4">
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/30">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="Document preview"
                className="max-h-80 w-full object-contain"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={explain}
                disabled={loading}
                className={cn(
                  "inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-saffron px-5 py-3.5 text-base font-semibold text-ink transition",
                  loading ? "opacity-70" : "hover:brightness-105"
                )}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Reading…
                  </>
                ) : (
                  <>
                    <FileText className="h-5 w-5" />
                    Explain this document
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm font-medium text-white/80 transition hover:bg-white/10"
              >
                <RefreshCw className="h-4 w-4" />
                Change
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Loading state */}
      {loading && (
        <div className="mt-6 flex flex-col items-center gap-3 rounded-3xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur">
          <Loader2 className="h-8 w-8 animate-spin text-saffron" />
          <p className="text-base font-medium text-white">Saathi is reading your document…</p>
          <p className="text-sm text-white/50">This takes just a few seconds. Please wait.</p>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="mt-6 flex items-start gap-3 rounded-3xl border border-red-500/30 bg-red-500/10 p-5 backdrop-blur">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
          <div className="flex-1">
            <p className="font-semibold text-white">Couldn&apos;t read it this time</p>
            <p className="mt-1 text-sm text-white/70">{error}</p>
            <button
              type="button"
              onClick={explain}
              className="mt-3 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
            >
              <RefreshCw className="h-4 w-4" />
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Result */}
      {result && !loading && (
        <section className="mt-6 space-y-5">
          {/* Verdict */}
          {(() => {
            const meta = VERDICT_META[result.verdict] ?? VERDICT_META.CAUTION;
            return (
              <div
                className={cn(
                  "rounded-3xl border p-6 backdrop-blur",
                  meta.ring,
                  meta.glow
                )}
              >
                <div className="flex items-start gap-4">
                  <span className="text-4xl leading-none" aria-hidden>
                    {meta.emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className={cn("text-xl font-bold", meta.text)}>{meta.label}</p>
                    <p className="mt-1 text-sm text-white/70">{meta.line}</p>
                    {result.documentType && (
                      <p className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/70">
                        <FileText className="h-3.5 w-3.5" />
                        {result.documentType}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Plain summary */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-white/50">
                What this says
              </h2>
              <button
                type="button"
                onClick={readAloud}
                className={cn(
                  "inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-sm font-medium transition",
                  speaking
                    ? "border-saffron/40 bg-saffron/15 text-saffron"
                    : "border-white/10 bg-white/5 text-white/80 hover:bg-white/10"
                )}
              >
                <Volume2 className="h-4 w-4" />
                {speaking ? "Stop" : "🔊 Read aloud"}
              </button>
            </div>
            <p className="text-lg leading-relaxed text-white">{result.plainSummary}</p>
          </div>

          {/* What to do */}
          {hasAction && (
            <div className="rounded-3xl border border-saffron/30 bg-saffron/10 p-6 backdrop-blur">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-saffron" />
                <div>
                  <h2 className="font-semibold text-white">What to do</h2>
                  <p className="mt-1 text-base leading-relaxed text-white/80">
                    {result.actionNeeded}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Info chips */}
          {(result.deadline || result.office) && (
            <div className="flex flex-wrap gap-3">
              {result.deadline && (
                <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur">
                  <CalendarClock className="h-4 w-4 text-red-400" />
                  <div>
                    <p className="text-xs text-white/50">Deadline</p>
                    <p className="text-sm font-semibold text-white">{result.deadline}</p>
                  </div>
                </div>
              )}
              {result.office && (
                <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur">
                  <Building2 className="h-4 w-4 text-indiagreen" />
                  <div>
                    <p className="text-xs text-white/50">Where to go</p>
                    <p className="text-sm font-semibold text-white">{result.office}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Checklist */}
          {result.requiredDocuments && result.requiredDocuments.length > 0 && (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <div className="mb-4 flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-saffron" />
                <h2 className="font-semibold text-white">Documents to carry</h2>
              </div>
              <ul className="space-y-2">
                {result.requiredDocuments.map((doc, i) => {
                  const isChecked = !!checked[i];
                  return (
                    <li key={i}>
                      <button
                        type="button"
                        onClick={() =>
                          setChecked((prev) => ({ ...prev, [i]: !prev[i] }))
                        }
                        className={cn(
                          "flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition",
                          isChecked
                            ? "border-indiagreen/40 bg-indiagreen/10"
                            : "border-white/10 bg-white/5 hover:bg-white/10"
                        )}
                      >
                        <span
                          className={cn(
                            "grid h-6 w-6 shrink-0 place-items-center rounded-lg border transition",
                            isChecked
                              ? "border-indiagreen bg-indiagreen text-ink"
                              : "border-white/20 bg-transparent"
                          )}
                        >
                          {isChecked && <CheckCircle2 className="h-4 w-4" />}
                        </span>
                        <span
                          className={cn(
                            "text-base",
                            isChecked ? "text-white/50 line-through" : "text-white"
                          )}
                        >
                          {doc}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* Footer actions */}
          <div className="flex flex-wrap gap-3 pt-1">
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-white/80 transition hover:bg-white/10"
            >
              <Upload className="h-4 w-4" />
              Explain another document
            </button>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-white/80 transition hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4" />
              Back home
            </Link>
          </div>
        </section>
      )}

      {/* Empty state (no file, no result) */}
      {!previewUrl && !result && !loading && !error && (
        <div className="mt-6 rounded-3xl border border-dashed border-white/10 bg-white/[0.02] p-6 text-center">
          <p className="text-sm text-white/50">
            Your explanation will appear here. Nothing is stored — only you can see your document.
          </p>
        </div>
      )}
    </main>
  );
}