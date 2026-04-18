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
    statusBarStyle: "black-translucent",
    title: "PowerPlattform",
  },
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/apple-icon.png",
  },
  title: {
    template: "%s | PowerPlattform",
    default: "PowerPlattform // Digital Hub",
  },
  description: "Authorized Social Hub for private Events and Nodes. Optimized for PWA and Mobile UX.",
  keywords: ["PowerPlattform", "Digital", "Hub", "Node", "Management", "PWA"],
  authors: [{ name: "PowerPlattform Team" }],
  creator: "PowerPlattform Team",
  publisher: "PowerPlattform Team",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "PowerPlattform // Digital Hub",
    description: "Authorized Social Hub for private Events and Nodes.",
    url: "https://power-app-template.com",
    siteName: "PowerPlattform",
    locale: "de_DE",
    type: "website",
    images: [{ url: "/icon-512.png", width: 512, height: 512, alt: "PowerPlattform Logo" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "PowerPlattform // Digital Hub",
    description: "Authorized Social Hub for private Events and Nodes.",
    images: ["/icon-512.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
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
