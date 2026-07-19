import type { Metadata } from "next";
import { Caveat, Geist, Geist_Mono, Space_Grotesk, VT323 } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { t } from "@/lib/i18n";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Landing (sketchpunk) fontları — sadece .landing kapsamında kullanılır
const crtDisplay = VT323({
  variable: "--font-crt",
  weight: "400",
  subsets: ["latin"],
});

const sketchHand = Caveat({
  variable: "--font-sketch",
  subsets: ["latin"],
});

const landingBody = Space_Grotesk({
  variable: "--font-landing-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: t.common.appName,
  description: "Mafilu — AI ile sosyal medya videosu üret, düzenle, paylaş.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className={cn(
        "h-full antialiased",
        geistSans.variable,
        geistMono.variable,
        crtDisplay.variable,
        sketchHand.variable,
        landingBody.variable
      )}
    >
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}
