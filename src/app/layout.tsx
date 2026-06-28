import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/app/providers";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "SMDP Portal",
  description: "Sistem Manajemen Dokumen Pegawai",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${inter.variable} font-sans antialiased bg-background text-foreground min-h-screen flex flex-col`}
        suppressHydrationWarning
      >
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  );
}
