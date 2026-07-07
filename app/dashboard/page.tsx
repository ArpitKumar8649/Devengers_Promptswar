"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import {
  Camera,
  MessageCircle,
  Target,
  FileText,
  ListChecks,
  Languages,
  ArrowRight,
  Sparkles,
} from "lucide-react";

type Tile = {
  href: string;
  title: string;
  subtitle: string;
  description: string;
  Icon: typeof Camera;
  hero?: boolean;
};

const TILES: Tile[] = [
  {
    href: "/report",
    title: "Samasya",
    subtitle: "Report a civic issue",
    description:
      "Snap a pothole, garbage pile or dead streetlight — Saathi rates it, routes it to the right department and files a tracked complaint.",
    Icon: Camera,
    hero: true,
  },
  {
    href: "/chat",
    title: "Baat Karo",
    subtitle: "Ask Saathi anything",
    description:
      "A streaming multilingual companion that answers civic queries and simplifies confusing government information.",
    Icon: MessageCircle,
  },
  {
    href: "/schemes",
    title: "Yojana",
    subtitle: "Find welfare schemes",
    description:
      "Describe your life in one line and discover the schemes you qualify for — with rupee amounts and the documents you need.",
    Icon: Target,
  },
  {
    href: "/documents",
    title: "Kaagaz",
    subtitle: "Understand any letter",
    description:
      "Upload a government letter for a plain-language explanation, a document checklist, and a read-aloud walkthrough.",
    Icon: FileText,
  },
  {
    href: "/track",
    title: "Track",
    subtitle: "Follow your complaint",
    description:
      "See your complaint move from Filed to Acknowledged to In Progress to Resolved on a clear timeline.",
    Icon: ListChecks,
  },
  {
    href: "/chat",
    title: "Multilingual",
    subtitle: "Six languages, one Saathi",
    description:
      "Hindi, Tamil, Bengali, Marathi, Telugu or English — pick your language in the nav and it flows into every answer.",
    Icon: Languages,
  },
];

export default function DashboardPage() {
  const { user, loading, isDemo, hasAccess } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !hasAccess) {
      router.replace("/");
    }
  }, [loading, hasAccess, router]);

  if (loading) {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-6xl items-center justify-center px-5">
        <div className="flex items-center gap-3 text-white/50">
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-saffron" />
          <span className="text-sm">Waking up Saathi…</span>
        </div>
      </main>
    );
  }

  if (!hasAccess) return null;

  const firstName =
    user?.displayName?.trim().split(/\s+/)[0] ||
    user?.email?.split("@")[0] ||
    "";

  const greeting = user
    ? `Namaste, ${firstName} 👋`
    : "Namaste 👋 (Demo Mode)";

  return (
    <main className="mx-auto max-w-6xl px-5 pb-20 pt-8 sm:pt-12">
      {/* Header */}
      <header className="mb-10">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/60 backdrop-blur">
          <Sparkles className="h-3.5 w-3.5 text-saffron" />
          Your civic companion
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          {greeting}
        </h1>
        <p className="mt-2 max-w-xl text-base text-white/60">
          {isDemo
            ? "You're exploring Smart Bharat in demo mode. Pick a service below to get started."
            : "What can Saathi help you with today? Choose a service to begin."}
        </p>
      </header>

      {/* Feature grid */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TILES.map(({ href, title, subtitle, description, Icon, hero }) => (
          <Link
            key={title}
            href={href}
            className={[
              "group relative flex flex-col rounded-3xl border p-6 backdrop-blur transition-all duration-300",
              "hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-saffron/60",
              hero
                ? "border-saffron/30 bg-saffron/[0.06] hover:border-saffron/50 hover:bg-saffron/[0.09] sm:col-span-2 lg:col-span-1"
                : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]",
            ].join(" ")}
          >
            {hero && (
              <span className="absolute right-5 top-5 rounded-full bg-saffron px-2.5 py-1 text-[11px] font-semibold text-ink">
                Start here
              </span>
            )}

            <div
              className={[
                "mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl border transition-colors duration-300",
                hero
                  ? "border-saffron/40 bg-saffron/15 text-saffron"
                  : "border-white/10 bg-white/[0.05] text-white group-hover:text-saffron",
              ].join(" ")}
            >
              <Icon className="h-6 w-6" />
            </div>

            <h2 className="text-lg font-semibold text-white">{title}</h2>
            <p className="mt-0.5 text-sm font-medium text-saffron/90">
              {subtitle}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-white/55">
              {description}
            </p>

            <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-white/50 transition-all duration-300 group-hover:gap-2.5 group-hover:text-saffron">
              Open
              <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        ))}
      </section>

      {/* Stats strip */}
      <p className="mt-10 flex flex-wrap items-center gap-x-2 gap-y-1 text-center text-xs text-white/40">
        <span>6 civic services</span>
        <span aria-hidden className="text-white/20">·</span>
        <span>6 languages</span>
        <span aria-hidden className="text-white/20">·</span>
        <span>powered by Qwen</span>
      </p>
    </main>
  );
}