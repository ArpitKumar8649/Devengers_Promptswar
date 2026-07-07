"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { MatchedScheme } from "@/lib/types";
import {
  Sparkles,
  Search,
  Loader2,
  CheckCircle2,
  Building2,
  IndianRupee,
  HeartHandshake,
  AlertCircle,
  SearchX,
  Brain,
} from "lucide-react";

const EXAMPLES: string[] = [
  "58 year old widow, no land, low income",
  "farmer with 1 acre in Bihar, daughter in class 11",
  "unemployed graduate, urban, low income",
  "pregnant woman, first child, rural",
  "senior citizen, 67, no pension",
];

type Status = "idle" | "loading" | "done" | "error";

export default function SchemesPage() {
  const { lang } = useLanguage();
  const [profile, setProfile] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [schemes, setSchemes] = useState<MatchedScheme[]>([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [think, setThink] = useState(false);

  const canSubmit = profile.trim().length > 0 && status !== "loading";

  async function findSchemes() {
    const text = profile.trim();
    if (!text) return;

    setStatus("loading");
    setErrorMsg("");
    setSchemes([]);

    try {
      const res = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile: text, language: lang.name, think }),
      });

      if (!res.ok) {
        throw new Error("bad-status");
      }

      const data: { matchedSchemes?: MatchedScheme[] } = await res.json();
      const list = Array.isArray(data.matchedSchemes) ? data.matchedSchemes : [];
      setSchemes(list);
      setStatus("done");
    } catch {
      setErrorMsg(
        "We couldn't reach the scheme finder just now. Please check your connection and try again."
      );
      setStatus("error");
    }
  }

  function useExample(text: string) {
    setProfile(text);
    if (status !== "loading") {
      setStatus("idle");
      setSchemes([]);
      setErrorMsg("");
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-start gap-3">
        <div className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-saffron/15 text-saffron">
          <HeartHandshake className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Yojana Finder</h1>
          <p className="mt-1 text-sm text-white/60">
            Tell us about yourself. We'll find the government schemes and money
            you deserve.
          </p>
        </div>
      </div>

      {/* Input card */}
      <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
        <label
          htmlFor="profile"
          className="mb-2 block text-sm font-medium text-white/80"
        >
          Describe your life in one line
        </label>
        <textarea
          id="profile"
          value={profile}
          onChange={(e) => setProfile(e.target.value)}
          rows={3}
          placeholder="e.g. 58 year old widow, no land, low income"
          className="w-full resize-none rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white placeholder:text-white/30 outline-none focus:border-saffron/60 focus:ring-2 focus:ring-saffron/30"
        />

        {/* Example chips */}
        <div className="mt-3">
          <div className="mb-2 flex items-center gap-1.5 text-xs text-white/40">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Tap an example to start</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => useExample(ex)}
                className={cn(
                  "rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/70 transition",
                  "hover:border-saffron/50 hover:bg-saffron/10 hover:text-white active:scale-95"
                )}
              >
                {ex}
              </button>
            ))}
          </div>
        </div>

        {/* Deep-reasoning toggle */}
        <button
          type="button"
          onClick={() => setThink((t) => !t)}
          aria-pressed={think}
          className={cn(
            "mt-4 flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition",
            think
              ? "border-saffron/50 bg-saffron/10"
              : "border-white/10 bg-white/5 hover:bg-white/10"
          )}
        >
          <span
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition",
              think ? "bg-saffron/20 text-saffron" : "bg-white/10 text-white/50"
            )}
          >
            <Brain className="h-5 w-5" />
          </span>
          <span className="flex-1">
            <span className="block text-sm font-medium text-white">
              Deep reasoning {think ? "on" : "off"}
            </span>
            <span className="block text-xs text-white/50">
              Let Saathi think harder for more precise matches (a little slower).
            </span>
          </span>
          <span
            className={cn(
              "relative h-6 w-11 shrink-0 rounded-full transition",
              think ? "bg-saffron" : "bg-white/20"
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all",
                think ? "left-[22px]" : "left-0.5"
              )}
            />
          </span>
        </button>

        {/* Submit */}
        <button
          type="button"
          onClick={findSchemes}
          disabled={!canSubmit}
          className={cn(
            "mt-4 flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3.5 text-base font-semibold transition",
            canSubmit
              ? "bg-saffron text-ink hover:brightness-105 active:scale-[0.99]"
              : "cursor-not-allowed bg-white/10 text-white/40"
          )}
        >
          {status === "loading" ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              {think ? "Thinking deeply…" : "Finding schemes…"}
            </>
          ) : (
            <>
              <Search className="h-5 w-5" />
              Find my schemes
            </>
          )}
        </button>
      </div>

      {/* Results region */}
      <div className="mt-6">
        {status === "loading" && (
          <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-white/10 bg-white/5 py-12 backdrop-blur">
            <Loader2 className="h-8 w-8 animate-spin text-saffron" />
            <p className="text-sm text-white/70">
              {think
                ? "Saathi is reasoning deeply about your situation…"
                : "Finding schemes you deserve…"}
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="flex items-start gap-3 rounded-3xl border border-red-400/20 bg-red-500/10 p-5 backdrop-blur">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-300" />
            <div className="flex-1">
              <p className="text-sm text-white/80">{errorMsg}</p>
              <button
                type="button"
                onClick={findSchemes}
                className="mt-3 rounded-xl bg-white/10 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-white/20"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {status === "done" && schemes.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-white/10 bg-white/5 px-6 py-12 text-center backdrop-blur">
            <SearchX className="h-8 w-8 text-white/40" />
            <p className="max-w-sm text-sm text-white/60">
              No matching schemes found — try adding more detail about age,
              income, or work.
            </p>
          </div>
        )}

        {status === "done" && schemes.length > 0 && (
          <>
            <p className="mb-3 px-1 text-sm text-white/70">
              <span className="font-semibold text-white">
                {schemes.length} scheme{schemes.length > 1 ? "s" : ""}
              </span>{" "}
              you may be entitled to 🎉
            </p>
            <div className="space-y-4">
              {schemes.map((s, i) => (
                <SchemeCard key={`${s.name}-${i}`} scheme={s} />
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}

function SchemeCard({ scheme }: { scheme: MatchedScheme }) {
  return (
    <article className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur transition hover:border-white/20">
      {/* Title + benefit pill */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h2 className="text-lg font-bold leading-tight text-white">
          {scheme.name}
        </h2>
        {scheme.benefitAmount ? (
          <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-indiagreen/20 px-3 py-1 text-sm font-semibold text-indiagreen ring-1 ring-indiagreen/30">
            <IndianRupee className="h-3.5 w-3.5" />
            {scheme.benefitAmount}
          </span>
        ) : null}
      </div>

      {/* Reason */}
      {scheme.reason ? (
        <p className="mt-2 text-sm leading-relaxed text-white/70">
          {scheme.reason}
        </p>
      ) : null}

      {/* Documents needed */}
      {scheme.documentsNeeded && scheme.documentsNeeded.length > 0 ? (
        <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-3">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-white/40">
            Documents needed
          </p>
          <ul className="space-y-1.5">
            {scheme.documentsNeeded.map((doc, i) => (
              <li
                key={`${doc}-${i}`}
                className="flex items-start gap-2 text-sm text-white/80"
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-indiagreen" />
                <span>{doc}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {/* Department tag */}
      {scheme.department ? (
        <div className="mt-4">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60">
            <Building2 className="h-3.5 w-3.5" />
            {scheme.department}
          </span>
        </div>
      ) : null}
    </article>
  );
}