import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { PwaProvider } from "@/components/pwa/PwaProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "YERO",
  description: "A calm, focused personal dashboard for your daily tasks.",

  applicationName: "YERO",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "YERO",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.png", type: "image/png", sizes: "32x32" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="font-sans antialiased min-h-full flex flex-col text-slate-800 bg-[#f8f9fb] selection:bg-slate-200 selection:text-slate-900">
        {/* Subtle ambient lighting meshes for liquid glass refraction */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10" aria-hidden="true">
          <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-slate-200/40 blur-3xl" />
          <div className="absolute top-1/4 right-0 w-80 h-80 rounded-full bg-amber-100/30 blur-3xl" />
          <div className="absolute bottom-10 left-1/3 w-96 h-96 rounded-full bg-slate-200/30 blur-3xl" />
        </div>
        <PwaProvider>{children}</PwaProvider>
      </body>
    </html>
  );
}

