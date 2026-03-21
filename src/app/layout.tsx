import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Luke the Duke — Portfolio",
    template: "%s · Luke the Duke",
  },
  description:
    "Luke Kimball — engineering portfolio (Cosmic Intelligence). Systems that compound: AI, trading, OSINT, and production infrastructure.",
  icons: {
    icon: [
      { url: "/brand/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/brand/favicon-16.png", sizes: "16x16", type: "image/png" },
    ],
    shortcut: "/brand/favicon.ico",
    apple: "/brand/apple-touch-icon.png",
  },
  openGraph: {
    title: "Luke the Duke — Portfolio · Cosmic Intelligence",
    description:
      "Luke Kimball — engineering portfolio. AI automation, trading systems, OSINT, and Docker Swarm infrastructure.",
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
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <div className="cosmic-bg" aria-hidden="true">
          <div className="cosmic-bg__nebula" />
          <div className="cosmic-bg__nebula cosmic-bg__nebula--accent" />
        </div>

        <Header />
        <main className="flex-1 relative">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
