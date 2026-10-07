import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Reachmark — Deploy beyond the ordinary.",
  description: "A calm, powerful cloud platform for deploying websites, APIs, databases, and background workers.",
};

export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="en"><body>{children}</body></html>;
}