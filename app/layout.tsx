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
  title: "QalbeTools - Premium AI APIs & Device Mockup Generator",
  description: "Access powerful AI APIs for Grammar Checking, Resume Analysis, and Passport Photo processing. Create stunning mockup designs for iPhone and MacBook. The ultimate tool suite for developers by QalbeTalks.",
  keywords: ["premium api", "ai grammar checker api", "resume parser api", "passport photo ai", "device mockup api", "free mockup generator", "iphone mockup api", "macbook mockup generator", "mockup tool", "qalbetalks", "qalbetools"],
  authors: [{ name: "QalbeTalks", url: "https://qalbetalks.com" }],
  metadataBase: new URL('https://qalbetools.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "QalbeTools - Premium AI APIs & Device Mockup Generator",
    description: "The ultimate tool suite for developers: AI APIs, Mockup Generators, and more.",
    url: "https://qalbetools.vercel.app",
    siteName: "QalbeTools",
    images: [
      {
        url: '/og-image.png', // User should add this image later
        width: 1200,
        height: 630,
        alt: 'QalbeTools Preview',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'QalbeTools - Premium AI APIs',
    description: 'Powerful AI tool suite for modern developers.',
    creator: '@qalbetalks',
  }
};

import FirebaseProvider from "@/components/FirebaseProvider";

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
      <body className="min-h-full flex flex-col">
        <FirebaseProvider>
          {children}
        </FirebaseProvider>
      </body>
    </html>
  );
}
