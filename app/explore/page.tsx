"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Compass, Flame, Sparkles } from "lucide-react";
import type { GalleryItem } from "@/data/gallery";
import { getActiveAdapters } from "@/lib/sourceAdapters";

export default function ExplorePage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all(getActiveAdapters().map((adapter) => adapter.fetchItems()))
      .then((batches) => setItems(batches.flat()))
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    const map = new Map<string, { count: number; preview?: GalleryItem }>();
    for (const item of items) {
      for (const category of item.categories) {
        const current = map.get(category) || { count: 0 };
        map.set(category, { count: current.count + 1, preview: current.preview || item });
      }
    }
    return [...map.entries()].sort((a, b) => b[1].count - a[1].count).slice(0, 18);
  }, [items]);

  const trending = useMemo(
    () => [...items].sort((a, b) => b.likes - a.likes).slice(0, 12),
    [items],
  );

  return (
    <main>
      <header className="topbar container">
        <Link className="brand" href="/"><span className="brand-mark">P</span><span>Promptino</span></Link>
        <nav><Link href="/"><ArrowRight size={16}/> خانه</Link></nav>
      </header>

      <section className="hero container explore-hero">
        <div className="eyebrow"><Compass size={16}/> Explore</div>
        <h1>کشف بر اساس <span>موضوع و ترند.</span></h1>
        <p>همه‌چیز از داده واقعی و Verified می‌آید؛ هیچ دسته یا آیتم دمو ساخته نمی‌شود.</p>
      </section>

      <section className="container explore-section">
        <div className="section-row"><h2><Sparkles size={18}/> دسته‌ها</h2><span>{loading ? "…" : categories.length.toLocaleString("fa-IR")}</span></div>
        <div className="category-grid">
          {categories.map(([name, meta]) => (
            <Link key={name} href={`/?q=${encodeURIComponent(name)}`} className="category-card">
              {meta.preview && <img src={meta.preview.kind === "image" ? meta.preview.mediaUrl : (meta.preview.posterUrl || "")} alt="" loading="lazy" />}
              <div><strong>{name}</strong><span>{meta.count.toLocaleString("fa-IR")} مورد</span></div>
            </Link>
          ))}
        </div>
      </section>

      <section className="container explore-section">
        <div className="section-row"><h2><Flame size={18}/> Trending</h2><span>بر اساس تعامل منبع</span></div>
        <div className="trending-strip">
          {trending.map((item) => (
            <Link key={item.id} href={`/?item=${encodeURIComponent(item.id)}`} className="trend-card">
              {item.kind === "image"
                ? <img src={item.mediaUrl} alt={item.title} loading="lazy"/>
                : <img src={item.posterUrl || ""} alt={item.title} loading="lazy"/>}
              <div><strong>{item.title}</strong><span>{item.likes.toLocaleString("fa-IR")} پسند</span></div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
