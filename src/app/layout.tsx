import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Luke Kimball — Developer & Entrepreneur",
  description:
    "Portfolio hub showcasing projects in AI, trading systems, OSINT intelligence, and infrastructure. Built with Next.js.",
  openGraph: {
    title: "Luke Kimball — Developer & Entrepreneur",
    description:
      "Projects spanning AI automation, algorithmic trading, OSINT platforms, and Docker Swarm infrastructure.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 antialiased`}>
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
