import type { Metadata, Viewport } from "next";
import PWAClient from "@/components/PWAClient";
import "./globals.css";

export const metadata: Metadata = {
  title: "Promptino | پرامپت‌های آماده هوش مصنوعی",
  description: "کتابخانه فارسی پرامپت واقعی و منبع‌دار برای تصویر و ویدیو.",
  applicationName: "Promptino",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Promptino",
  },
  manifest: "/promptino/manifest.webmanifest",
  icons: {
    icon: "/promptino/icon.svg",
    apple: "/promptino/icon.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#090b10",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fa" dir="rtl" data-theme="dark">
      <body>
        {children}
        <PWAClient />
      </body>
    </html>
  );
}
