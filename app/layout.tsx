import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pulseframelabs Studio",
  description: "Live overlay studio for casino streamers — widgets, viewer pages, and chat automation",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

