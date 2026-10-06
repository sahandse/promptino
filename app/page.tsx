"use client";

import Link from "next/link";
import { useState } from "react";
import { Search, Home as HomeIcon, Compass, FolderHeart, Clapperboard } from "lucide-react";
import VisualFeed from "@/components/VisualFeed";
import ThemeToggle from "@/components/ThemeToggle";

export default function Home() {
  const [query, setQuery] = useState("");

  return (
    <main className="app-shell">
      <header className="app-topbar container">
        <Link className="brand" href="/">
          <span className="brand-mark">P</span>
          <span>Promptino</span>
        </Link>

        <div className="topbar-actions">
          <ThemeToggle />
          <nav className="desktop-nav">
            <Link href="/reels">Reels</Link>
            <Link href="/explore">Explore</Link>
            <Link href="/collections">مجموعه‌ها</Link>
            <Link href="/history">تاریخچه</Link>
            <Link href="/media-favorites">علاقه‌مندی‌ها</Link>
            <Link href="/health">سلامت منابع</Link>
            <Link href="/stats">آمار من</Link>
            <Link href="/reports">گزارش‌ها</Link>
            <Link href="/sources">منابع</Link>
          </nav>
        </div>
      </header>

      <section className="app-search-wrap container">
        <div className="app-search">
          <Search size={20} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="جستجو در پرامپت‌های واقعی..."
            aria-label="جستجوی پرامپت"
          />
        </div>
      </section>

      <VisualFeed query={query} />

      <nav className="mobile-bottom-nav reels-nav" aria-label="ناوبری موبایل">
        <Link href="/" className="active"><HomeIcon size={20} /><span>خانه</span></Link>
        <Link href="/explore"><Compass size={20} /><span>کشف</span></Link>
        <Link href="/reels" className="reels-nav-main"><Clapperboard size={22} /><span>Reels</span></Link>
        <Link href="/collections"><FolderHeart size={20} /><span>مجموعه‌ها</span></Link>
      </nav>
    </main>
  );
}
