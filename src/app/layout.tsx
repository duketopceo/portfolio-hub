import type { Metadata } from "next";
import { Exo, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { SiteFooter } from "@/components/SiteChrome";

const exo = Exo({
  subsets: ["latin"],
  variable: "--font-exo",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://luke-the-duke.com"),
  title: {
    default: "Cosmic Intelligence · Luke Kimball",
    template: "%s · Cosmic Intelligence",
  },
  description:
    "Cosmic Intelligence — Luke Kimball’s engineering portfolio. Deep space meets clean engineering: systems that compound across AI, trading, OSINT, and production infrastructure.",
  icons: {
    icon: [
      { url: "/brand/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/brand/favicon-16.png", sizes: "32x32", type: "image/png" },
    ],
    shortcut: "/brand/favicon.ico",
    apple: "/brand/apple-touch-icon.png",
  },
  openGraph: {
    title: "Cosmic Intelligence · Luke Kimball",
    description:
      "Engineering portfolio — systems that compound. Applied AI, OpenRouter demos, and production infrastructure on Railway.",
    type: "website",
    images: [{ url: "/brand/og-image.png", width: 1200, height: 630 }],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${exo.variable} ${jetbrains.variable} antialiased`}
        style={{
          "--font-display": "var(--font-exo)",
          "--font-body": "var(--font-exo)",
          "--font-mono": "var(--font-jetbrains)",
        } as React.CSSProperties}
      >
        <Header />
        <main className="flex-1 relative pt-16">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
