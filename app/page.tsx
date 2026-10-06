"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Copy, Check, Search, Sparkles, Bookmark, ExternalLink,
  Home as HomeIcon, Heart, Layers3,
} from "lucide-react";
import { prompts } from "@/data/prompts";
import FavoriteButton from "@/components/FavoriteButton";
import VisualFeed from "@/components/VisualFeed";

export default function Home() {
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return prompts;
    return prompts.filter((item) =>
      [item.title, item.prompt, item.model, item.category, ...item.tags]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [query]);

  async function copyPrompt(id: string, value: string) {
    await navigator.clipboard.writeText(value);
    setCopied(id);
    window.setTimeout(() => setCopied(null), 1600);
  }

  return (
    <main className="app-shell">
      <header className="app-topbar container">
        <Link className="brand" href="/">
          <span className="brand-mark">P</span>
          <span>Promptino</span>
        </Link>

        <nav className="desktop-nav">
          <Link href="/media-favorites">علاقه‌مندی‌ها</Link>
          <Link href="/sources">منابع</Link>
          <Link href="/favorites" className="ghost-btn">
            <Bookmark size={18} /> ذخیره‌ها
          </Link>
        </nav>
      </header>

      <section className="app-search-wrap container">
        <div className="app-search">
          <Search size={20} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="جستجو در پرامپت‌ها..."
            aria-label="جستجوی پرامپت"
          />
        </div>
      </section>

      <VisualFeed query={query} />

      <section className="text-prompts container" id="text-prompts">
        <div className="compact-section-head">
          <div>
            <span className="mini-kicker"><Sparkles size={14} /> پرامپت‌های متنی</span>
            <h2>پرامپت‌های آماده برای کپی</h2>
          </div>
          <span>{filtered.length.toLocaleString("fa-IR")} مورد</span>
        </div>

        <div className="grid compact-grid">
          {filtered.map((item) => (
            <article className="prompt-card" key={item.id}>
              <div className="card-top">
                <div>
                  <span className={`type-pill ${item.type}`}>
                    {item.type === "image" ? "تصویر" : item.type === "video" ? "ویدیو" : "متن"}
                  </span>
                  <span className="model-pill">{item.model}</span>
                </div>
                <FavoriteButton id={item.id} compact />
              </div>

              <div>
                <p className="category">{item.category}</p>
                <h2><Link href={`/prompt/${item.id}`}>{item.title}</Link></h2>
                <p className="prompt-preview">{item.prompt}</p>
              </div>

              <div className="card-actions">
                <button className="copy-btn" onClick={() => copyPrompt(item.id, item.prompt)}>
                  {copied === item.id ? <Check size={18} /> : <Copy size={18} />}
                  {copied === item.id ? "کپی شد" : "کپی"}
                </button>
                <a href={item.sourceUrl} target="_blank" rel="noreferrer" className="source-btn">
                  منبع <ExternalLink size={15} />
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <nav className="mobile-bottom-nav" aria-label="ناوبری موبایل">
        <Link href="/" className="active"><HomeIcon size={20} /><span>خانه</span></Link>
        <a href="#visual-feed"><Layers3 size={20} /><span>فید</span></a>
        <Link href="/media-favorites"><Heart size={20} /><span>علاقه‌مندی</span></Link>
        <Link href="/favorites"><Bookmark size={20} /><span>ذخیره‌ها</span></Link>
      </nav>
    </main>
  );
}
