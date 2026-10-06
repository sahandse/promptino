"use client";

import { useEffect, useMemo, useState } from "react";
import { Bookmark, Copy, ExternalLink } from "lucide-react";
import { prompts } from "@/data/prompts";
import FavoriteButton from "@/components/FavoriteButton";

const KEY = "promptino:favorites";

export default function FavoritesPage() {
  const [ids, setIds] = useState<string[]>([]);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    try {
      const value = JSON.parse(localStorage.getItem(KEY) || "[]");
      setIds(Array.isArray(value) ? value : []);
    } catch {
      setIds([]);
    }
  }, []);

  const items = useMemo(() => prompts.filter((item) => ids.includes(item.id)), [ids]);

  async function copy(id: string, value: string) {
    await navigator.clipboard.writeText(value);
    setCopied(id);
    window.setTimeout(() => setCopied(null), 1500);
  }

  function refresh() {
    try {
      const value = JSON.parse(localStorage.getItem(KEY) || "[]");
      setIds(Array.isArray(value) ? value : []);
    } catch {
      setIds([]);
    }
  }

  return (
    <main>
      <header className="topbar container">
        <a className="brand" href="/">
          <span className="brand-mark">P</span>
          <span>Promptino</span>
        </a>
        <nav>
          <a href="/">خانه</a>
          <a href="/sources">منابع</a>
        </nav>
      </header>

      <section className="hero container favorites-hero">
        <div className="eyebrow"><Bookmark size={16} /> ذخیره‌های من</div>
        <h1>پرامپت‌هایی که<br /><span>نگه داشته‌ای.</span></h1>
        <p>ذخیره‌ها فقط روی همین مرورگر نگه‌داری می‌شوند و نیاز به ثبت‌نام ندارند.</p>
      </section>

      {items.length === 0 ? (
        <section className="empty-state container">
          <div className="empty-icon"><Bookmark size={28} /></div>
          <h2>هنوز چیزی ذخیره نکردی</h2>
          <p>از صفحه اصلی روی آیکون ذخیره هر پرامپت بزن تا اینجا نمایش داده شود.</p>
          <a className="copy-btn empty-action" href="/">مشاهده پرامپت‌ها</a>
        </section>
      ) : (
        <section className="grid container">
          {items.map((item) => (
            <article className="prompt-card" key={item.id}>
              <div className="card-top">
                <div>
                  <span className={`type-pill ${item.type}`}>
                    {item.type === "image" ? "تصویر" : item.type === "video" ? "ویدیو" : "متن"}
                  </span>
                  <span className="model-pill">{item.model}</span>
                </div>
                <span onClick={refresh}><FavoriteButton id={item.id} compact /></span>
              </div>

              <div>
                <p className="category">{item.category}</p>
                <h2><a href={`/prompt/${item.id}`}>{item.title}</a></h2>
                <p className="prompt-preview">{item.prompt}</p>
              </div>

              <div className="card-actions">
                <button className="copy-btn" onClick={() => copy(item.id, item.prompt)}>
                  <Copy size={18} />
                  {copied === item.id ? "کپی شد" : "کپی پرامپت"}
                </button>
                <a href={item.sourceUrl} target="_blank" rel="noreferrer" className="source-btn">
                  منبع <ExternalLink size={16} />
                </a>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
