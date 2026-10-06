import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Promptino | پرامپت‌های آماده هوش مصنوعی",
  description: "کتابخانه فارسی پرامپت برای متن، تصویر و ویدیو با قابلیت کپی سریع.",
  applicationName: "Promptino",
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
      <body>{children}</body>
    </html>
  );
}
