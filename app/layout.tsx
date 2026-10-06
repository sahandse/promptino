import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Promptino | پرامپت‌های آماده هوش مصنوعی",
  description: "کتابخانه فارسی پرامپت برای متن، تصویر و ویدیو با قابلیت کپی سریع.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fa" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
