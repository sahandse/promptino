"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, ChevronDown, Copy, Heart, ImageIcon, Share2, Video, X } from "lucide-react";
import type { GalleryItem } from "@/data/gallery";
import { cacheItems, readCachedItems, readFavorites, recordCopy, recordViewed, toggleFavoriteItem } from "@/lib/visualSource";
import { getActiveAdapters } from "@/lib/sourceAdapters";
import { categoryLabel, normalizeSearch } from "@/lib/labels";

const MOBILE_PAGE_SIZE = 10;
const DESKTOP_PAGE_SIZE = 30;

function haptic(ms = 8) {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate(ms);
}

function Card({ item, onOpen }: { item: GalleryItem; onOpen: (item: GalleryItem) => void }) {
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [broken, setBroken] = useState(false);

  useEffect(() => {
    const sync = () => setSaved(readFavorites().some((savedItem) => savedItem.id === item.id));
    sync();
    window.addEventListener("promptino:favorites-changed", sync);
    return () => window.removeEventListener("promptino:favorites-changed", sync);
  }, [item.id]);

  if (broken) return null;

  async function copyPrompt() {
    haptic();
    await navigator.clipboard.writeText(item.prompt);
    recordCopy(item);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  }

  return (
    <article className="visual-card simple-card">
      <div className="visual-media-wrap" onClick={() => onOpen(item)}>
        {item.kind === "video" ? (
          <video
            className="visual-media"
            src={item.mediaUrl}
            poster={item.posterUrl || undefined}
            muted
            playsInline
            preload="none"
            onError={() => setBroken(true)}
          />
        ) : (
          <img
            className="visual-media"
            src={item.mediaUrl}
            alt={item.title}
            loading="lazy"
            decoding="async"
            onError={() => setBroken(true)}
          />
        )}

        <button
          className={saved ? "media-favorite saved" : "media-favorite"}
          onClick={(event) => {
            event.stopPropagation();
            haptic(10);
            setSaved(toggleFavoriteItem(item));
          }}
          aria-label="علاقه‌مندی"
        >
          <Heart size={18} fill={saved ? "currentColor" : "none"} />
        </button>
      </div>

      <div className={item.kind === "image" ? "visual-card-body image-card-actions" : "visual-card-body"}>
        {item.kind === "video" && <h3>{item.title}</h3>}
        <button className="copy-btn minimal-copy" onClick={copyPrompt}>
          {copied ? <Check size={16} /> : <Copy size={16} />}
          {copied ? "کپی شد" : "کپی"}
        </button>
      </div>
    </article>
  );
}

function Skeleton() {
  return (
    <div className="visual-masonry skeleton-feed" aria-hidden="true">
      {Array.from({ length: 10 }).map((_, index) => (
        <div className="visual-card skeleton-card" key={index}>
          <div className="skeleton-media" />
        </div>
      ))}
    </div>
  );
}

export default function VisualFeed({ query = "" }: { query?: string }) {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [tab, setTab] = useState<"image" | "video">("image");
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selected, setSelected] = useState<GalleryItem | null>(null);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [pageSize, setPageSize] = useState(MOBILE_PAGE_SIZE);
  const [shuffleSeed] = useState(() => Math.random());

  useEffect(() => {
    let alive = true;
    const adapters = getActiveAdapters();
    const merged = new Map<string, GalleryItem>();

    const rank = (id: string) => {
      let hash = Math.floor(shuffleSeed * 2147483647) || 1;
      for (let i = 0; i < id.length; i += 1) hash = (hash * 33 + id.charCodeAt(i)) >>> 0;
      return hash;
    };

    const publish = (batch: GalleryItem[]) => {
      for (const item of batch) {
        const key = item.prompt.trim().toLowerCase() + "::" + item.mediaUrl;
        if (!merged.has(key)) merged.set(key, item);
      }
      const unique = [...merged.values()];
      const imageItems = unique
        .filter((item) => item.kind === "image")
        .sort((a, b) => rank(a.id) - rank(b.id));
      const videoItems = unique.filter((item) => item.kind === "video");
      const next = [...imageItems, ...videoItems];
      if (!alive) return;
      setItems(next);
      window.setTimeout(() => cacheItems(next).catch(() => undefined), 1200);
    };

    async function load() {
      try {
        if (!adapters.length) throw new Error("No public source available");

        const primary = await adapters[0].fetchItems();
        if (!primary.length) throw new Error("Primary source unavailable");
        publish(primary);
        if (alive) setLoading(false);

        const loadMore = async () => {
          const results = await Promise.allSettled(adapters.slice(1).map((adapter) => adapter.fetchItems()));
          if (!alive) return;
          for (const result of results) {
            if (result.status === "fulfilled" && result.value.length) publish(result.value);
          }
        };

        if ("requestIdleCallback" in window) {
          (window as Window & { requestIdleCallback: (callback: () => void, options?: { timeout: number }) => number })
            .requestIdleCallback(() => { void loadMore(); }, { timeout: 1800 });
        } else {
          globalThis.setTimeout(() => { void loadMore(); }, 4000);
        }
      } catch {
        const cached = await readCachedItems().catch(() => null);
        if (!alive) return;
        if (cached?.items?.length) setItems(cached.items);
        else setError(true);
        setLoading(false);
      }
    }

    void load();
    return () => { alive = false; };
  }, [shuffleSeed]);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 760px)");
    const syncPageSize = () => {
      setPageSize(media.matches ? MOBILE_PAGE_SIZE : DESKTOP_PAGE_SIZE);
      setPage(1);
    };
    syncPageSize();
    media.addEventListener?.("change", syncPageSize);
    return () => media.removeEventListener?.("change", syncPageSize);
  }, []);

  useEffect(() => {
    setPage(1);
  }, [tab, query, category]);

  const categories = useMemo(() => {
    return Array.from(
      new Set(
        items
          .filter((item) => item.kind === tab)
          .flatMap((item) => item.categories)
      )
    ).sort();
  }, [items, tab]);

  const filtered = useMemo(() => {
    const q = normalizeSearch(query);
    return items.filter((item) => {
      if (item.kind !== tab) return false;
      if (category !== "all" && !item.categories.includes(category)) return false;
      if (!q) return true;
      return normalizeSearch([
        item.title,
        item.prompt,
        item.model,
        item.category,
        item.sourceName,
        ...item.tags,
      ].join(" ")).includes(q);
    });
  }, [items, tab, query, category]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visible = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  const pageNumbers = useMemo(() => {
    const start = Math.max(1, Math.min(currentPage - 2, pageCount - 4));
    const end = Math.min(pageCount, start + 4);
    return Array.from({ length: Math.max(0, end - start + 1) }, (_, index) => start + index);
  }, [currentPage, pageCount]);

  function openItem(item: GalleryItem) {
    recordViewed(item);
    setSelected(item);
  }

  async function share(item: GalleryItem) {
    const url = new URL(window.location.href);
    url.searchParams.set("item", item.id);
    if (navigator.share) {
      await navigator.share({ title: item.title, text: item.prompt.slice(0, 150), url: url.toString() }).catch(() => undefined);
    } else {
      await navigator.clipboard.writeText(url.toString());
    }
  }

  return (
    <section className="visual-feed-section container minimal-home-feed" id="visual-feed">
      <div className="media-tabs-wrap simple-media-tabs">
        <div className="media-tabs">
          <button className={tab === "image" ? "media-tab active" : "media-tab"} onClick={() => setTab("image")}>
            <ImageIcon size={17} /> عکس
          </button>
          <button className={tab === "video" ? "media-tab active" : "media-tab"} onClick={() => setTab("video")}>
            <Video size={17} /> ویدیو
          </button>
        </div>

        <button
          className="category-trigger"
          onClick={() => setCategoryOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={categoryOpen}
        >
          <span>{category === "all" ? "همه دسته‌ها" : categoryLabel(category)}</span>
          <ChevronDown size={16} />
        </button>
      </div>

      {loading && !items.length ? (
        <Skeleton />
      ) : error ? (
        <div className="feed-empty">دریافت فید واقعی ناموفق بود.</div>
      ) : (
        <>
          <div className="visual-masonry">
            {visible.map((item) => <Card key={item.id} item={item} onOpen={openItem} />)}
          </div>

          {filtered.length > pageSize && (
            <nav className="pagination" aria-label="صفحه‌بندی">
              <button
                onClick={() => {
                  setPage((value) => Math.max(1, value - 1));
                  document.getElementById("visual-feed")?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                disabled={currentPage === 1}
              >
                قبلی
              </button>

              <div className="pagination-numbers">
                {pageNumbers.map((number) => (
                  <button
                    key={number}
                    className={currentPage === number ? "active" : ""}
                    onClick={() => {
                      setPage(number);
                      document.getElementById("visual-feed")?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                  >
                    {number.toLocaleString("fa-IR")}
                  </button>
                ))}
              </div>

              <button
                onClick={() => {
                  setPage((value) => Math.min(pageCount, value + 1));
                  document.getElementById("visual-feed")?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                disabled={currentPage === pageCount}
              >
                بعدی
              </button>
            </nav>
          )}
        </>
      )}

      {categoryOpen && (
        <div className="category-sheet-backdrop" role="presentation" onClick={() => setCategoryOpen(false)}>
          <div className="category-sheet" role="dialog" aria-modal="true" aria-label="انتخاب دسته‌بندی" onClick={(event) => event.stopPropagation()}>
            <div className="sheet-handle" />
            <div className="category-sheet-head">
              <strong>دسته‌بندی</strong>
              <button onClick={() => setCategoryOpen(false)} aria-label="بستن"><X size={19} /></button>
            </div>
            <div className="category-sheet-list">
              <button
                className={category === "all" ? "active" : ""}
                onClick={() => { setCategory("all"); setCategoryOpen(false); }}
              >
                <span>همه دسته‌ها</span>
                {category === "all" && <Check size={16} />}
              </button>
              {categories.map((value) => (
                <button
                  key={value}
                  className={category === value ? "active" : ""}
                  onClick={() => { setCategory(value); setCategoryOpen(false); }}
                >
                  <span>{categoryLabel(value)}</span>
                  {category === value && <Check size={16} />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {selected && (
        <div className="media-modal" role="dialog" aria-modal="true" onClick={() => setSelected(null)}>
          <div className="media-modal-card bottom-sheet minimal-detail" onClick={(event) => event.stopPropagation()}>
            <div className="sheet-handle" />
            <button className="media-modal-close" onClick={() => setSelected(null)} aria-label="بستن"><X size={20} /></button>

            <div className="media-modal-stage">
              {selected.kind === "video" ? (
                <video src={selected.mediaUrl} poster={selected.posterUrl || undefined} controls autoPlay playsInline />
              ) : (
                <img src={selected.mediaUrl} alt={selected.title} />
              )}
            </div>

            <div className="media-modal-info">
              <div>
                <span className="model-pill">{categoryLabel(selected.category)}</span>
                <h3>{selected.title}</h3>
                <p className="full-prompt" dir="auto">{selected.prompt}</p>
              </div>

              <div className="media-modal-actions">
                <button className="copy-btn" onClick={async () => {
                  await navigator.clipboard.writeText(selected.prompt);
                  recordCopy(selected);
                }}>
                  <Copy size={16} /> کپی
                </button>
                <button className="source-btn action-button" onClick={() => share(selected)}><Share2 size={15} /> اشتراک</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
