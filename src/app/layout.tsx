import type { Metadata } from "next";
export const dynamic = "force-dynamic";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://power-app-template.com"),
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Power App",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png",
  },
  title: {
    template: "%s | Power Platform",
    default: "Power Platform | Management & Listings",
  },
  description: "Premium Management Engine for Teams and Listings. Optimized for PWA and Mobile UX.",
  keywords: ["Platform", "Management", "PWA", "Enterprise", "Template"],
  authors: [{ name: "Power Platform Team" }],
  creator: "Power Platform Team",
  publisher: "Power Platform Team",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "Power Platform Template",
    description: "Premium Management Engine for Teams and Listings.",
    url: "https://power-app-template.com",
    siteName: "Power Platform",
    locale: "de_DE",
    type: "website",
    images: [{ url: "/banner.jpg", width: 1200, height: 630, alt: "Platform Banner" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Power Platform Template",
    description: "Premium Management Engine for Teams and Listings.",
    images: ["/banner.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport = {
  themeColor: "#1a4731",
};

import CookieConsent from "@/components/CookieConsent";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className={`${geistSans.variable} ${geistMono.variable}`}>
       <body className="antialiased">
        {children}
        <CookieConsent />
        <Script id="register-sw" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js').then(function(registration) {
                  console.log('ServiceWorker registration successful with scope: ', registration.scope);
                }, function(err) {
                  console.log('ServiceWorker registration failed: ', err);
                });
              });
            }
          `}
        </Script>
      </body>
    </html>
  );
}
