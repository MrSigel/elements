import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Overlay Studio",
  description: "Twitch overlay orchestration studio"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

