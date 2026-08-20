import type { Metadata } from "next";
import { Inter, Source_Code_Pro } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import WelcomeIntro from "@/components/WelcomeIntro";
import { SiteBackground, SiteFooter } from "@/components/SiteChrome";

/** Supabase DESIGN.md (VoltAgent): Inter substitutes licensed Circular at w500 display / w400 body */
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["400", "500", "600"],
});

const sourceCodePro = Source_Code_Pro({
  subsets: ["latin"],
  variable: "--font-source-mono",
  display: "swap",
  weight: ["400", "500"],
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
        className={`${inter.variable} ${sourceCodePro.variable} antialiased`}
      >
        <SiteBackground />
        <WelcomeIntro />

        <Header />
        <main className="flex-1 relative animate-page-in">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
