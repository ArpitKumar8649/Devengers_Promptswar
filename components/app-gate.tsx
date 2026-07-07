"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import Nav from "@/components/nav";

/**
 * Gates the app:
 * - "/" (landing) always renders, with no nav.
 * - Every other route requires access (signed in OR demo mode); otherwise we
 *   redirect to the landing. The nav renders only on gated app routes.
 */
export default function AppGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { hasAccess, loading } = useAuth();

  const isLanding = pathname === "/";

  useEffect(() => {
    if (!isLanding && !loading && !hasAccess) {
      router.replace("/");
    }
  }, [isLanding, loading, hasAccess, router]);

  // Landing manages its own layout (and its own redirect when already authed).
  if (isLanding) return <>{children}</>;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-white/15 border-t-saffron" />
      </div>
    );
  }

  if (!hasAccess) {
    // Redirect effect is firing; render nothing to avoid a flash of app content.
    return null;
  }

  return (
    <>
      <Nav />
      {children}
    </>
  );
}
