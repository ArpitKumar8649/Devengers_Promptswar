"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Camera,
  MessageCircle,
  Target,
  FileText,
  ListChecks,
  Bot,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Spline is heavy 3D — load it client-side only, after mount.
const Spline = dynamic(() => import("@splinetool/react-spline"), {
  ssr: false,
});

const SPLINE_SCENE = "https://prod.spline.design/q2kdsR-Mc3hnQyFB/scene.splinecode";

const ITEMS = [
  { href: "/report", label: "Samasya", sub: "Report an issue", icon: Camera },
  { href: "/chat", label: "Baat Karo", sub: "Ask Saathi", icon: MessageCircle },
  { href: "/schemes", label: "Yojana", sub: "Find schemes", icon: Target },
  { href: "/documents", label: "Kaagaz", sub: "Read a document", icon: FileText },
  { href: "/track", label: "Track", sub: "My complaints", icon: ListChecks },
];

export default function SaathiBot() {
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const router = useRouter();

  function go(href: string) {
    setOpen(false);
    router.push(href);
  }

  return (
    <>
      {/* Click-away backdrop */}
      {open && (
        <button
          aria-label="Close menu"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 cursor-default"
        />
      )}

      <div className="pointer-events-none fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
        {/* Quick-launch menu */}
        {open && (
          <div className="pointer-events-auto w-60 origin-bottom-right overflow-hidden rounded-3xl border border-white/10 bg-black/90 shadow-2xl shadow-black/50 backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <span className="text-sm font-semibold text-white">
                How can Saathi help? 🇮🇳
              </span>
              <button
                onClick={() => setOpen(false)}
                className="text-white/40 transition hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-2">
              {ITEMS.map(({ href, label, sub, icon: Icon }) => (
                <button
                  key={href}
                  onClick={() => go(href)}
                  className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition hover:bg-white/[0.06]"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-saffron">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="flex-1">
                    <span className="block text-sm font-medium text-white">{label}</span>
                    <span className="block text-xs text-white/50">{sub}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* The floating robot (whole area is the button) */}
        <button
          onClick={() => setOpen((o) => !o)}
          aria-label="Open Saathi assistant"
          className="pointer-events-auto group relative h-28 w-28 sm:h-36 sm:w-36"
        >
          {/* glow */}
          <span className="absolute inset-3 rounded-full bg-saffron/20 blur-2xl transition group-hover:bg-saffron/30" />

          {/* fallback shown until Spline loads (or if it fails) */}
          {!loaded && (
            <span className="absolute inset-0 grid place-items-center">
              <span className="grid h-16 w-16 place-items-center rounded-full border border-white/10 bg-black/60 text-saffron shadow-xl backdrop-blur animate-pulse">
                <Bot className="h-7 w-7" />
              </span>
            </span>
          )}

          {/* Spline robot — non-interactive so the button reliably captures clicks */}
          <span className="pointer-events-none absolute inset-0 overflow-hidden">
            <Spline scene={SPLINE_SCENE} onLoad={() => setLoaded(true)} />
          </span>

          {/* hint pill */}
          {!open && (
            <span
              className={cn(
                "absolute -left-2 top-1/2 -translate-x-full -translate-y-1/2 whitespace-nowrap rounded-full border border-white/10 bg-black/80 px-3 py-1 text-xs text-white/80 shadow-lg backdrop-blur transition",
                "opacity-0 group-hover:opacity-100",
              )}
            >
              Ask Saathi ✨
            </span>
          )}
        </button>
      </div>
    </>
  );
}
