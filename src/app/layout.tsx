import type { Metadata } from "next";
import Script from "next/script";
import { Archivo, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import WelcomeIntro from "@/components/WelcomeIntro";
import CardTorch from "@/components/CardTorch";
import UmamiOutbound from "@/components/UmamiOutbound";
import { SiteBackground, SiteFooter } from "@/components/SiteChrome";

/** Star Chart system: Archivo industrial grotesk (display + body), JetBrains Mono for all meta/labels */
const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jbmono",
  display: "swap",
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
      { url: "/brand/favicon-16.png", sizes: "16x16", type: "image/png" },
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
        className={`${archivo.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <SiteBackground />
        <WelcomeIntro />

        <Header />
        <main className="flex-1 relative animate-page-in">{children}</main>
        <SiteFooter />
        <UmamiOutbound />
        <CardTorch />
        <Script
          src="https://analytics.pacehq.io/script.js"
          data-website-id="85c70ffd-c5dc-4f8a-a18e-b13bbe101904"
          strategy="beforeInteractive"
          defer
        />
      </body>
    </html>
  );
}
