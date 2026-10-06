"use client";

import Link from "next/link";
import { useState } from "react";
import { Search, Home as HomeIcon, Heart, Layers3, Database } from "lucide-react";
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
            <Link href="/media-favorites">علاقه‌مندی‌ها</Link>
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

      <nav className="mobile-bottom-nav" aria-label="ناوبری موبایل">
        <Link href="/" className="active"><HomeIcon size={20} /><span>خانه</span></Link>
        <a href="#visual-feed"><Layers3 size={20} /><span>فید</span></a>
        <Link href="/media-favorites"><Heart size={20} /><span>علاقه‌مندی</span></Link>
        <Link href="/sources"><Database size={20} /><span>منابع</span></Link>
      </nav>
    </main>
  );
}
