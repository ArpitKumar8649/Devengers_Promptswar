"use client";

import { useAuth } from "@/lib/auth";

/** Personalized greeting on the landing hub — only shows when signed in. */
export default function Greeting() {
  const { user, enabled } = useAuth();
  if (!enabled || !user) return null;
  const name = user.displayName?.split(" ")[0] ?? "friend";
  return (
    <p className="mt-4 text-sm text-saffron/90">
      Namaste, {name} 👋 — your complaints are saved to your account.
    </p>
  );
}
