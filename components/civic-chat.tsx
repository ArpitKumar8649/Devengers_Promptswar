"use client";

import { useRef, useState } from "react";
import { Send, Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n";

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "मुझे राशन कार्ड बनवाना है, क्या डॉक्युमेंट चाहिए?",
  "Am I eligible for the PM-Kisan scheme?",
  "How do I report a broken streetlight in my area?",
  "Explain the Ayushman Bharat health card in simple words",
];

export default function CivicChat() {
  const { lang } = useLanguage();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  async function send(text: string) {
    const content = text.trim();
    if (!content || loading) return;

    const next: Msg[] = [...messages, { role: "user", content }];
    setMessages(next);
    setInput("");
    setLoading(true);

    // Placeholder assistant message we stream into.
    setMessages((m) => [...m, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: next, language: lang.name }),
      });

      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => ({ error: "Request failed" }));
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = { role: "assistant", content: "⚠️ " + (err.error ?? "Something went wrong.") };
          return copy;
        });
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = { role: "assistant", content: acc };
          return copy;
        });
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex h-[70vh] w-full max-w-2xl flex-col rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl">
      <div
        ref={scrollRef}
        className="flex-1 space-y-4 overflow-y-auto p-5"
      >
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-5 text-center">
            <Sparkles className="h-10 w-10 text-saffron" />
            <p className="max-w-sm text-sm text-white/60">
              Ask me anything about government schemes, documents, or civic issues —
              in <span className="text-white">Hindi, English, or any Indian language</span>.
            </p>
            <div className="grid w-full gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-left text-sm text-white/80 transition hover:border-saffron/50 hover:bg-white/10"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            className={cn(
              "flex",
              m.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                m.role === "user"
                  ? "bg-saffron text-ink font-medium"
                  : "border border-white/10 bg-white/5 text-white/90"
              )}
            >
              {m.content || (
                <Loader2 className="h-4 w-4 animate-spin text-white/50" />
              )}
            </div>
          </div>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex items-center gap-2 border-t border-white/10 p-3"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your question in any language…"
          className="flex-1 rounded-xl bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-saffron/50"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="grid h-11 w-11 place-items-center rounded-xl bg-saffron text-ink transition hover:opacity-90 disabled:opacity-40"
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </button>
      </form>
    </div>
  );
}
