import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agent Personalize — CustomGPT.ai",
  description: "Personalize your AI agent",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
