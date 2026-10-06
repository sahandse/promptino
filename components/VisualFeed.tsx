"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, ExternalLink, Heart, Play } from "lucide-react";
import { galleryItems, type GalleryItem } from "@/data/gallery";

const FAVORITES_KEY = "promptino:media-favorites";
const BATCH = 12;

function readFavorites(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const value = JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function VisualCard({ item }: { item: GalleryItem }) {
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setSaved(readFavorites().includes(item.id));
  }, [item.id]);

  function toggleFavorite() {
    const current = readFavorites();
    const next = current.includes(item.id)
      ? current.filter((id) => id !== item.id)
      : [...current, item.id];
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
    setSaved(next.includes(item.id));
    window.dispatchEvent(new Event("promptino:favorites-changed"));
  }

  async function copyPrompt() {
    await navigator.clipboard.writeText(item.prompt);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <article className="visual-card">
      <div className="visual-media-wrap">
        {item.kind === "video" ? (
          <>
            <video
              className="visual-media"
              src={item.mediaUrl}
              controls
              playsInline
              preload="metadata"
            />
            <span className="media-kind-badge"><Play size={13} /> ویدیو</span>
          </>
        ) : (
          <img
            className="visual-media"
            src={item.mediaUrl}
            alt={item.title}
            loading="lazy"
            decoding="async"
          />
        )}
        <button
          type="button"
          className={saved ? "media-favorite saved" : "media-favorite"}
          onClick={toggleFavorite}
          aria-label={saved ? "حذف از علاقه‌مندی" : "افزودن به علاقه‌مندی"}
        >
          <Heart size={18} fill={saved ? "currentColor" : "none"} />
        </button>
      </div>

      <div className="visual-card-body">
        <div className="visual-meta">
          <span>{item.model}</span>
          <span>{item.kind === "video" ? "ویدیو" : "تصویر"}</span>
        </div>
        <h3>{item.title}</h3>
        <p>{item.prompt}</p>

        <div className="visual-tags">
          {item.tags.map((tag) => <span key={tag}>#{tag}</span>)}
        </div>

        <div className="visual-actions">
          <button type="button" className="copy-btn" onClick={copyPrompt}>
            {copied ? <Check size={17} /> : <Copy size={17} />}
            {copied ? "کپی شد" : "کپی پرامپت"}
          </button>
          <a className="source-btn" href={item.sourceUrl} target="_blank" rel="noreferrer">
            منبع <ExternalLink size={15} />
          </a>
        </div>
      </div>
    </article>
  );
}

export default function VisualFeed() {
  const [visibleCount, setVisibleCount] = useState(BATCH);
  const sentinel = useRef<HTMLDivElement | null>(null);

  const visible = useMemo(
    () => galleryItems.slice(0, visibleCount),
    [visibleCount],
  );

  useEffect(() => {
    const node = sentinel.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount((current) => Math.min(current + BATCH, galleryItems.length));
        }
      },
      { rootMargin: "700px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="visual-feed-section container" id="visual-feed">
      <div className="section-heading">
        <div>
          <p className="section-kicker">Visual Prompt Feed</p>
          <h2>ببین، انتخاب کن، کپی کن.</h2>
          <p>عکس و ویدیو داخل خود Promptino نمایش داده می‌شود؛ برای هر مورد منبع و علاقه‌مندی هم داری.</p>
        </div>
        <div className="feed-stats">
          <strong>{galleryItems.length}+</strong>
          <span>نمونه اولیه؛ آرشیو در حال گسترش</span>
        </div>
      </div>

      <div className="visual-masonry">
        {visible.map((item) => <VisualCard key={item.id} item={item} />)}
      </div>

      {visibleCount < galleryItems.length ? (
        <div ref={sentinel} className="feed-loader" aria-label="بارگذاری بیشتر">
          <span />
          <span />
          <span />
        </div>
      ) : (
        <div className="feed-end">فعلاً به انتهای این بخش رسیدی؛ منابع بیشتری اضافه می‌شوند ✦</div>
      )}
    </section>
  );
}
