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
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/apple-icon.png",
  },
  title: {
    template: "%s | Qloud Hub",
    default: "Power Platform // Qloud Hub",
  },
  description: "Authorized Social Hub for private Events and Nodes. Optimized for PWA and Mobile UX.",
  keywords: ["Qloud", "Social", "Hub", "Platform", "Management", "PWA"],
  authors: [{ name: "Qloud Hub Team" }],
  creator: "Qloud Hub Team",
  publisher: "Qloud Hub Team",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "Power Platform // Qloud Hub",
    description: "Authorized Social Hub for private Events and Nodes.",
    url: "https://power-app-template.com",
    siteName: "Qloud Hub",
    locale: "de_DE",
    type: "website",
    images: [{ url: "/icon-512.png", width: 512, height: 512, alt: "Qloud Hub Logo" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Power Platform // Qloud Hub",
    description: "Authorized Social Hub for private Events and Nodes.",
    images: ["/icon-512.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport = {
  themeColor: "#fbff00",
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
