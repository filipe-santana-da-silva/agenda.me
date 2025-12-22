import type { Metadata } from "next";
import "./globals.css";
import AuthProviderWrapper from "@/contexts/AuthProviderWrapper";
import { Toaster } from '@/components/ui/sonner'


export const metadata: Metadata = {
  title: "Dashboard - agenda.me",
  description: "app de gestão interno",
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta charSet="utf-8" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <AuthProviderWrapper>{children}</AuthProviderWrapper>
        <Toaster />
      </body>
    </html>
  );
}
