import Link from "next/link";
import { MessageCircle, Camera, Target, FileText, ListChecks, ArrowRight } from "lucide-react";

const TILES = [
  {
    href: "/report",
    icon: Camera,
    title: "Samasya",
    sub: "Report a public issue",
    desc: "Snap a photo of a pothole, garbage or broken light → AI files a routed complaint with a tracking ID.",
    accent: "from-saffron/20 to-transparent",
    badge: "HERO",
  },
  {
    href: "/chat",
    icon: MessageCircle,
    title: "Baat Karo",
    sub: "Ask anything",
    desc: "Chat with Saathi about any government scheme, document or process — in your language.",
    accent: "from-indiagreen/20 to-transparent",
  },
  {
    href: "/schemes",
    icon: Target,
    title: "Yojana Finder",
    sub: "Schemes you deserve",
    desc: "Describe your life in one line → discover the welfare schemes you're eligible for, with amounts.",
    accent: "from-blue-500/20 to-transparent",
  },
  {
    href: "/documents",
    icon: FileText,
    title: "Kaagaz",
    sub: "Understand any letter",
    desc: "Upload a government letter → get a plain-language explanation and the exact documents you need.",
    accent: "from-purple-500/20 to-transparent",
  },
  {
    href: "/track",
    icon: ListChecks,
    title: "Track",
    sub: "Your complaints",
    desc: "Follow every complaint you filed through Filed → Acknowledged → In Progress → Resolved.",
    accent: "from-pink-500/20 to-transparent",
  },
];

export default function Home() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <section className="mb-12 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-white/70">
          <span className="h-2 w-2 rounded-full bg-indiagreen" />
          Powered by Qwen (DashScope) · DEVENGERS PromptWars 2026
        </div>
        <h1 className="bg-gradient-to-r from-saffron via-white to-indiagreen bg-clip-text text-5xl font-bold tracking-tight text-transparent sm:text-7xl">
          Smart Bharat
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-balance text-lg text-white/60">
          Meet <span className="text-white">Saathi</span> — your AI civic companion.
          Access government services, report public issues, find schemes you deserve,
          and understand any document — <span className="text-white">in your own language</span>.
        </p>
        <div className="mt-7 flex justify-center gap-3">
          <Link
            href="/report"
            className="inline-flex items-center gap-2 rounded-xl bg-saffron px-5 py-3 font-semibold text-ink transition hover:opacity-90"
          >
            <Camera className="h-5 w-5" /> Report an issue
          </Link>
          <Link
            href="/chat"
            className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-3 font-semibold text-white transition hover:bg-white/10"
          >
            <MessageCircle className="h-5 w-5" /> Ask Saathi
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TILES.map((t) => {
          const Icon = t.icon;
          return (
            <Link
              key={t.href}
              href={t.href}
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 transition hover:border-white/25 hover:bg-white/[0.07]"
            >
              <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${t.accent} opacity-60`} />
              <div className="relative">
                {t.badge && (
                  <span className="absolute right-0 top-0 rounded-full bg-saffron/20 px-2 py-0.5 text-[10px] font-bold text-saffron">
                    {t.badge}
                  </span>
                )}
                <div className="mb-4 inline-flex rounded-2xl bg-white/10 p-3">
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">{t.title}</h2>
                <p className="text-sm text-saffron/90">{t.sub}</p>
                <p className="mt-2 text-sm leading-relaxed text-white/60">{t.desc}</p>
                <div className="mt-4 inline-flex items-center gap-1 text-sm text-white/70 transition group-hover:gap-2 group-hover:text-white">
                  Open <ArrowRight className="h-4 w-4" />
                </div>
              </div>
            </Link>
          );
        })}
      </section>

      <footer className="mt-14 text-center text-xs text-white/40">
        Built for the Smart Bharat challenge · One companion · Six civic superpowers · Multilingual by design
      </footer>
    </main>
  );
}
