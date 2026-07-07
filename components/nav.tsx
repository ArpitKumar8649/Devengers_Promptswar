"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LANGUAGES, useLanguage } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { MessageCircle, Camera, Target, FileText, ListChecks, Home } from "lucide-react";

const LINKS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/chat", label: "Baat Karo", icon: MessageCircle },
  { href: "/report", label: "Samasya", icon: Camera },
  { href: "/schemes", label: "Yojana", icon: Target },
  { href: "/documents", label: "Kaagaz", icon: FileText },
  { href: "/track", label: "Track", icon: ListChecks },
];

export default function Nav() {
  const pathname = usePathname();
  const { lang, setLang } = useLanguage();

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-ink/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-3">
        <Link href="/" className="mr-2 flex items-center gap-2 font-bold">
          <span className="text-lg">🇮🇳</span>
          <span className="bg-gradient-to-r from-saffron via-white to-indiagreen bg-clip-text text-transparent">
            Smart Bharat
          </span>
        </Link>

        <nav className="hidden flex-1 items-center gap-1 md:flex">
          {LINKS.slice(1).map((l) => {
            const Icon = l.icon;
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition",
                  active
                    ? "bg-saffron/20 text-saffron"
                    : "text-white/60 hover:bg-white/5 hover:text-white",
                )}
              >
                <Icon className="h-4 w-4" />
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto">
          <select
            value={lang.code}
            onChange={(e) => setLang(e.target.value)}
            aria-label="Language"
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white outline-none focus:ring-2 focus:ring-saffron/50"
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code} className="bg-ink">
                {l.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Mobile nav */}
      <nav className="flex items-center gap-1 overflow-x-auto px-2 pb-2 md:hidden">
        {LINKS.slice(1).map((l) => {
          const Icon = l.icon;
          const active = pathname === l.href;
          return (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs transition",
                active ? "bg-saffron/20 text-saffron" : "text-white/60",
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {l.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
