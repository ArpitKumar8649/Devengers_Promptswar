"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import { getFirebaseAuth, isFirebaseConfigured } from "./firebase";

const DEMO_KEY = "sb_demo";

type AuthCtx = {
  user: User | null;
  /** True until auth state + demo flag are resolved (used to avoid content flash). */
  loading: boolean;
  /** True only when Firebase env vars are present — gates whether we show the Google button. */
  enabled: boolean;
  /** Demo mode active (no account). */
  isDemo: boolean;
  /** user || isDemo — whether the visitor may enter the app. */
  hasAccess: boolean;
  signIn: () => Promise<void>;
  enterDemo: () => void;
  signOutUser: () => Promise<void>;
};

const Ctx = createContext<AuthCtx>({
  user: null,
  loading: true,
  enabled: false,
  isDemo: false,
  hasAccess: false,
  signIn: async () => {},
  enterDemo: () => {},
  signOutUser: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [loading, setLoading] = useState(true);
  const enabled = isFirebaseConfigured;

  useEffect(() => {
    // Restore demo flag first.
    try {
      if (localStorage.getItem(DEMO_KEY) === "1") setIsDemo(true);
    } catch {
      /* ignore */
    }

    const auth = getFirebaseAuth();
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  async function signIn() {
    const auth = getFirebaseAuth();
    if (!auth) return;
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (err) {
      // Non-blocking: a cancelled popup or config issue must never crash the app.
      console.error("Sign-in failed:", (err as Error).message);
    }
  }

  function enterDemo() {
    setIsDemo(true);
    try {
      localStorage.setItem(DEMO_KEY, "1");
    } catch {
      /* ignore */
    }
  }

  async function signOutUser() {
    setIsDemo(false);
    try {
      localStorage.removeItem(DEMO_KEY);
    } catch {
      /* ignore */
    }
    const auth = getFirebaseAuth();
    if (auth) {
      try {
        await signOut(auth);
      } catch (err) {
        console.error("Sign-out failed:", (err as Error).message);
      }
    }
  }

  const hasAccess = Boolean(user) || isDemo;

  return (
    <Ctx.Provider
      value={{ user, loading, enabled, isDemo, hasAccess, signIn, enterDemo, signOutUser }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  return useContext(Ctx);
}
