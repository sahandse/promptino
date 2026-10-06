"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Heart, Copy, ExternalLink, Play, Check } from "lucide-react";
import { galleryItems } from "@/data/gallery";

const KEY = "promptino:media-favorites";

function readIds(): string[] {
  try {
    const value = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

export default function MediaFavoritesPage() {
  const [ids, setIds] = useState<string[]>([]);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    const sync = () => setIds(readIds());
    sync();
    window.addEventListener("promptino:favorites-changed", sync);
    return () => window.removeEventListener("promptino:favorites-changed", sync);
  }, []);

  const items = useMemo(() => galleryItems.filter((item) => ids.includes(item.id)), [ids]);

  function remove(id: string) {
    const next = readIds().filter((item) => item !== id);
    localStorage.setItem(KEY, JSON.stringify(next));
    setIds(next);
  }

  async function copy(id: string, text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    window.setTimeout(() => setCopied(null), 1400);
  }

  return (
    <main>
      <header className="topbar container">
        <Link className="brand" href="/"><span className="brand-mark">P</span><span>Promptino</span></Link>
        <nav><Link href="/">خانه</Link><Link href="/favorites">پرامپت‌های ذخیره‌شده</Link></nav>
      </header>

      <section className="hero container favorites-hero">
        <div className="eyebrow"><Heart size={16} /> علاقه‌مندی‌های تصویری</div>
        <h1>عکس‌ها و ویدیوهای<br /><span>مورد علاقه‌ات.</span></h1>
      </section>

      {items.length === 0 ? (
        <section className="empty-state container">
          <div className="empty-icon"><Heart size={28} /></div>
          <h2>هنوز عکس یا ویدیویی ذخیره نکردی</h2>
          <p>در فید تصویری روی قلب هر مورد بزن.</p>
          <Link className="copy-btn empty-action" href="/#visual-feed">رفتن به فید</Link>
        </section>
      ) : (
        <section className="visual-masonry container">
          {items.map((item) => (
            <article className="visual-card" key={item.id}>
              <div className="visual-media-wrap">
                {item.kind === "video" ? (
                  <>
                    <video className="visual-media" src={item.mediaUrl} controls playsInline preload="metadata" />
                    <span className="media-kind-badge"><Play size={13} /> ویدیو</span>
                  </>
                ) : (
                  <img className="visual-media" src={item.mediaUrl} alt={item.title} loading="lazy" />
                )}
                <button className="media-favorite saved" onClick={() => remove(item.id)} aria-label="حذف از علاقه‌مندی">
                  <Heart size={18} fill="currentColor" />
                </button>
              </div>
              <div className="visual-card-body">
                <h3>{item.title}</h3>
                <p>{item.prompt}</p>
                <div className="visual-actions">
                  <button className="copy-btn" onClick={() => copy(item.id, item.prompt)}>
                    {copied === item.id ? <Check size={17} /> : <Copy size={17} />}
                    {copied === item.id ? "کپی شد" : "کپی"}
                  </button>
                  <a className="source-btn" href={item.sourceUrl} target="_blank" rel="noreferrer">
                    منبع <ExternalLink size={15} />
                  </a>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
