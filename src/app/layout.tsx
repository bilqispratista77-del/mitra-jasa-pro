import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import WhatsAppFloating from "@/components/whatsapp-floating";
import GitUploadGuide from "@/components/git-upload-guide";
import DownloadButton from "@/components/download-button";
import { AuthInitializer } from "@/components/auth-initializer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mitra Jasa Pro - Marketplace Jasa Terpercaya di Indonesia",
  description: "Temukan dan tawarkan jasa terbaik di Indonesia. Marketplace jasa profesional dengan koneksi langsung via WhatsApp. Desain, web development, konten, dan banyak lagi.",
  keywords: ["jasa", "marketplace", "freelance", "Indonesia", "WhatsApp", "desain", "web development"],
  authors: [{ name: "Mitra Jasa Pro Team" }],
  icons: {
    icon: [
      { url: "/icon.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <AuthInitializer />
        {children}
        <WhatsAppFloating />
        <GitUploadGuide />
        <DownloadButton />
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
