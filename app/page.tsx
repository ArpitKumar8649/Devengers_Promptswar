"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { GlowingShadow } from "@/components/glowing-shadow";
import {
  MessageCircle,
  Camera,
  Target,
  FileText,
  ListChecks,
  Languages,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

const FEATURES = [
  { icon: Camera, name: "Samasya", line: "Snap a pothole — AI files the complaint for you." },
  { icon: MessageCircle, name: "Baat Karo", line: "Chat with Saathi in your own language." },
  { icon: Target, name: "Yojana", line: "One line about you → schemes you can claim." },
  { icon: FileText, name: "Kaagaz", line: "Upload a govt letter → plain meaning, read aloud." },
  { icon: ListChecks, name: "Track", line: "Follow every complaint to resolution." },
  { icon: Languages, name: "Multilingual", line: "6 Indian languages, built in." },
];

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
      <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z" />
    </svg>
  );
}

export default function LandingPage() {
  const { loading, enabled, hasAccess, signIn, enterDemo } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (hasAccess) router.replace("/dashboard");
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
    <main className="relative min-h-screen overflow-hidden">
      {/* ambient accents */}
      <div className="pointer-events-none absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-saffron/10 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-72 w-72 rounded-full bg-indiagreen/10 blur-[120px]" />

      <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-6 py-16 lg:grid-cols-2 lg:py-24">
        {/* Left: copy + CTAs */}
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/60 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-indiagreen" />
            AI-powered civic companion for every Indian
          </div>

          <h1 className="text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
            <span className="bg-gradient-to-r from-saffron via-white to-indiagreen bg-clip-text text-transparent">
              Smart Bharat
            </span>
          </h1>
          <p className="mt-4 text-xl font-medium text-white/85 sm:text-2xl">
            Meet <span className="text-saffron">Saathi</span> — your government, made simple.
          </p>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-white/55 sm:text-base">
            Report civic issues with a photo, find welfare schemes you deserve, decode
            confusing letters, and get answers — spoken in the language you speak.
          </p>

          {/* CTAs */}
          <div className="mt-9 flex w-full max-w-sm flex-col gap-3">
            {enabled && (
              <button
                onClick={() => signIn()}
                className="group inline-flex items-center justify-center gap-3 rounded-2xl border border-white/15 bg-white px-6 py-3.5 text-sm font-semibold text-ink transition-all duration-200 hover:bg-white/90 active:scale-[0.98]"
              >
                <GoogleIcon />
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
            <p className="flex items-center justify-center gap-1.5 text-xs text-white/40 lg:justify-start">
              <ShieldCheck className="h-3.5 w-3.5" />
              No sign-up needed — dive straight in.
            </p>
          </div>
        </div>

        {/* Right: glowing showcase card */}
        <div className="flex justify-center lg:justify-end">
          <GlowingShadow maxWidth={420}>
            <div className="flex flex-col items-center gap-3">
              <span className="text-5xl">🇮🇳</span>
              <p className="text-lg font-semibold text-white">One companion.</p>
              <p className="text-sm text-white/60">
                Six civic superpowers.
                <br />
                Six Indian languages.
              </p>
            </div>
          </GlowingShadow>
        </div>
      </div>

      {/* Feature grid */}
      <div className="relative mx-auto max-w-6xl px-6 pb-20">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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

        <footer className="mt-14 flex flex-col items-center gap-2 text-center">
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
      </div>
    </main>
  );
}
