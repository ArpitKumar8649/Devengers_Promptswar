"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { LogIn, LogOut, Loader2, FlaskConical } from "lucide-react";

export default function AuthButton() {
  const { user, loading, enabled, isDemo, signIn, signOutUser } = useAuth();
  const [open, setOpen] = useState(false);
  const router = useRouter();

  if (loading) {
    return <Loader2 className="h-4 w-4 animate-spin text-white/40" />;
  }

  // Signed-in user → avatar menu.
  if (user) {
    const initial = (user.displayName ?? user.email ?? "U").charAt(0).toUpperCase();
    return (
      <div className="relative">
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 py-1 pl-1 pr-2 transition hover:border-white/25"
        >
          {user.photoURL ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.photoURL}
              alt=""
              className="h-6 w-6 rounded-full"
              referrerPolicy="no-referrer"
            />
          ) : (
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-saffron text-xs font-bold text-ink">
              {initial}
            </span>
          )}
          <span className="hidden max-w-[90px] truncate text-sm text-white/80 sm:inline">
            {user.displayName ?? "Account"}
          </span>
        </button>

        {open && (
          <div className="absolute right-0 z-50 mt-2 w-48 overflow-hidden rounded-xl border border-white/10 bg-black/95 shadow-2xl backdrop-blur">
            <div className="border-b border-white/10 px-3 py-2">
              <p className="truncate text-sm text-white">{user.displayName ?? "Signed in"}</p>
              <p className="truncate text-xs text-white/50">{user.email}</p>
            </div>
            <button
              onClick={async () => {
                setOpen(false);
                await signOutUser();
                router.replace("/");
              }}
              className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-white/80 transition hover:bg-white/5"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        )}
      </div>
    );
  }

  // Demo mode → show a Demo chip; offer Google sign-in (if enabled) or exit.
  if (isDemo) {
    return (
      <div className="flex items-center gap-2">
        <span className="hidden items-center gap-1 rounded-full border border-saffron/30 bg-saffron/10 px-2.5 py-1 text-xs font-medium text-saffron sm:inline-flex">
          <FlaskConical className="h-3 w-3" />
          Demo
        </span>
        {enabled ? (
          <button
            onClick={signIn}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/80 transition hover:border-saffron/50 hover:text-white"
          >
            <LogIn className="h-4 w-4" />
            <span className="hidden sm:inline">Sign in</span>
          </button>
        ) : (
          <button
            onClick={async () => {
              await signOutUser();
              router.replace("/");
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/70 transition hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Exit</span>
          </button>
        )}
      </div>
    );
  }

  // Not signed in, not demo (rare on gated routes) → offer sign-in if available.
  if (!enabled) return null;
  return (
    <button
      onClick={signIn}
      className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/80 transition hover:border-saffron/50 hover:text-white"
    >
      <LogIn className="h-4 w-4" />
      <span className="hidden sm:inline">Sign in</span>
    </button>
  );
}
