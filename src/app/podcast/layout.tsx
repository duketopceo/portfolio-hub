import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Luke the Duke Show — Dashboard",
  description: "Live companion dashboard with charts, data, and analysis.",
  openGraph: {
    title: "Luke the Duke Show — Dashboard",
    description: "Live companion dashboard with charts, data, and analysis.",
    type: "website",
  },
};

export default function PodcastLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <link
        href="https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@700,800&f[]=satoshi@400,500,700&display=swap"
        rel="stylesheet"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap"
        rel="stylesheet"
      />
      <link rel="stylesheet" href="/podcast/base.css" />
      <link rel="stylesheet" href="/podcast/style.css" />
      {children}
    </>
  );
}
