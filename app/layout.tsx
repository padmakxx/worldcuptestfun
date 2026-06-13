import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "⚽ WC2026 Predictor",
  description: "FIFA World Cup 2026 Prediction Game — Predict. Compete. Win!",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="stadium-bg min-h-screen">{children}</body>
    </html>
  );
}
