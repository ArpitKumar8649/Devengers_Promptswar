import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/lib/i18n";
import Nav from "@/components/nav";

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
        <LanguageProvider>
          <Nav />
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
