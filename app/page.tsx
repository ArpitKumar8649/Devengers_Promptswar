"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import {
  MessageCircle,
  Camera,
  Target,
  FileText,
  ListChecks,
  Languages,
  Sparkles,
  ArrowRight,
} from "lucide-react";

const FEATURES = [
  {
    icon: MessageCircle,
    name: "Baat Karo",
    line: "Chat with Saathi in your language to decode civic queries.",
  },
  {
    icon: Camera,
    name: "Samasya",
    line: "Snap a pothole or garbage pile — AI files the complaint for you.",
  },
  {
    icon: Target,
    name: "Yojana",
    line: "One line about your life → the welfare schemes you can claim.",
  },
  {
    icon: FileText,
    name: "Kaagaz",
    line: "Upload a govt letter → plain-language meaning, read aloud.",
  },
  {
    icon: ListChecks,
    name: "Track",
    line: "Follow every complaint from Filed to Resolved.",
  },
  {
    icon: Languages,
    name: "Multilingual",
    line: "Hindi, Tamil, Bengali, Marathi, Telugu & English — built in.",
  },
];

export default function LandingPage() {
  const { loading, enabled, hasAccess, signIn, enterDemo } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (hasAccess) {
      router.replace("/dashboard");
    }
  }, [hasAccess, router]);

  const handleDemo = () => {
    enterDemo();
    router.push("/dashboard");
  };

  if (loading || hasAccess) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/15 border-t-saffron" />
          <p className="text-sm text-white/50">Loading Saathi…</p>
        </div>
      </main>
    );
  }

  return (
    <main className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col items-center px-6 pb-16 pt-16 sm:pt-24">
      {/* Chip */}
      <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-xs text-white/70 backdrop-blur">
        <Sparkles className="h-3.5 w-3.5 text-saffron" />
        <span>DEVENGERS PromptWars 2026 · Powered by Qwen</span>
      </div>

      {/* Hero */}
      <div className="flex flex-col items-center text-center">
        <h1 className="bg-gradient-to-r from-saffron via-white to-indiagreen bg-clip-text text-5xl font-extrabold leading-tight tracking-tight text-transparent sm:text-7xl">
          Smart Bharat
        </h1>
        <p className="mt-5 max-w-2xl text-lg font-medium text-white/80 sm:text-xl">
          Saathi — your AI civic companion
        </p>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/55 sm:text-base">
          Making government schemes, complaints and paperwork simple, spoken and
          accessible for every Indian citizen — in the language they speak.
        </p>
      </div>

      {/* CTAs */}
      <div className="mt-10 flex w-full max-w-sm flex-col items-stretch gap-3">
        {enabled && (
          <button
            onClick={() => signIn()}
            className="group inline-flex items-center justify-center gap-3 rounded-2xl border border-white/15 bg-white px-6 py-3.5 text-sm font-semibold text-ink transition-all duration-200 hover:bg-white/90 active:scale-[0.98]"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z"
              />
            </svg>
            Continue with Google
          </button>
        )}

        <button
          onClick={handleDemo}
          className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-saffron px-6 py-3.5 text-sm font-semibold text-ink shadow-lg shadow-saffron/20 transition-all duration-200 hover:brightness-105 active:scale-[0.98]"
        >
          Explore in Demo Mode
          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
        </button>

        {!enabled && (
          <p className="mt-1 text-center text-xs text-white/40">
            No sign-up needed — dive straight in.
          </p>
        )}
      </div>

      {/* Feature grid */}
      <div className="mt-16 grid w-full grid-cols-1 gap-4 sm:mt-20 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map(({ icon: Icon, name, line }) => (
          <div
            key={name}
            className="group rounded-3xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.06]"
          >
            <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-saffron transition-colors duration-200 group-hover:border-saffron/30">
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold text-white">{name}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-white/55">{line}</p>
          </div>
        ))}
      </div>

      {/* Footer */}
      <footer className="mt-16 flex flex-col items-center gap-2 text-center sm:mt-20">
        <p className="text-xs text-white/40">
          Built for the Smart Bharat challenge · GenAI civic companion
        </p>
        <Link
          href="/dashboard"
          className="text-xs text-white/30 transition-colors duration-200 hover:text-white/60"
        >
          Enter dashboard →
        </Link>
      </footer>
    </main>
  );
}