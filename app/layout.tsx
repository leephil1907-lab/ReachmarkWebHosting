import type { Metadata, Viewport } from "next";
import "./globals.css";
import { PageTransition } from "@/components/page-transition";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Reachmark Webhosting — Deploy beyond the ordinary.",
    template: "%s — Reachmark Webhosting",
  },
  description:
    "Developer cloud infrastructure for deploying applications, services, databases, domains, and observability from one control plane.",
  applicationName: "Reachmark Webhosting",
  generator: "Next.js",
  keywords: [
    "Reachmark Webhosting",
    "cloud hosting",
    "developer cloud",
    "application hosting",
    "Docker hosting",
    "GitHub deployments",
    "PostgreSQL hosting",
    "Redis hosting",
    "developer infrastructure",
    "deployment platform",
  ],
  authors: [{ name: "Reachmark" }],
  creator: "Reachmark",
  publisher: "Reachmark",
  category: "technology",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
  },
  manifest: "/site.webmanifest",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Reachmark Webhosting",
    title: "Reachmark Webhosting — Deploy beyond the ordinary.",
    description:
      "Deploy applications, services, databases, domains, and observability from one developer control plane.",
  },
  twitter: {
    card: "summary",
    title: "Reachmark Webhosting — Deploy beyond the ordinary.",
    description:
      "Developer cloud infrastructure for shipping and operating modern applications from one control plane.",
  },
};

export const viewport: Viewport = {
  themeColor: "#08090b",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="bg-[#050609]">
      <body className="min-h-screen bg-[#050609] text-white antialiased">
        <PageTransition>{children}</PageTransition>
      </body>
    </html>
  );
}
