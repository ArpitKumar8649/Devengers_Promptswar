import CivicChat from "@/components/civic-chat";

export default function ChatPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <header className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-white">💬 Baat Karo</h1>
        <p className="mt-2 text-sm text-white/60">
          Ask Saathi anything about schemes, documents, or civic services — in your language.
        </p>
      </header>
      <CivicChat />
    </main>
  );
}
