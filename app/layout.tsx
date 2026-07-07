import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/lib/i18n";
import { AuthProvider } from "@/lib/auth";
import AppGate from "@/components/app-gate";

export const metadata: Metadata = {
  title: "Smart Bharat — AI Civic Companion",
  description:
    "GenAI-powered civic companion helping Indian citizens access government services, report issues, and get personalized multilingual assistance. Powered by Qwen.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <AuthProvider>
          <LanguageProvider>
            <AppGate>{children}</AppGate>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
