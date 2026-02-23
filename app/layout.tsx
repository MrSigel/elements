import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pulseframelabs Studio",
  description: "Live overlay studio for casino streamers — widgets, viewer pages, and chat automation"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

