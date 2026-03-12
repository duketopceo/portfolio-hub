import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Portfolio — Systems Engineer & Builder",
  description:
    "Engineering portfolio showcasing projects across AI, trading systems, OSINT platforms, and production infrastructure.",
  openGraph: {
    title: "Portfolio — Systems Engineer & Builder",
    description:
      "Projects spanning AI automation, algorithmic trading, OSINT platforms, and Docker Swarm infrastructure.",
    type: "website",
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
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}
      >
        {/* Blueprint grid background — CSS-only, decorative */}
        <div className="grid-bg" aria-hidden="true" />

        <Header />
        <main className="flex-1 relative">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
