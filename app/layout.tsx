import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "QalbeTools - Free Device Mockup API & Generator",
  description: "Generate beautiful, professional device mockups instantly (iPhone, MacBook) with our free API. Fast, reliable, and perfect for apps and portfolios. Powered by QalbeTalks.",
  keywords: ["device mockup api", "free mockup generator", "iphone mockup api", "macbook mockup generator", "mockup tool", "qalbetalks", "qalbetools"],
  authors: [{ name: "QalbeTalks", url: "https://qalbetalks.com" }],
  openGraph: {
    title: "QalbeTools - Free Device Mockup API & Generator",
    description: "Generate beautiful device mockups instantly with our free API.",
    url: "https://qalbetools.vercel.app",
    siteName: "QalbeTools",
    type: "website",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
