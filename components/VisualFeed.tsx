"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, ExternalLink, Heart, ImageIcon, Share2, Video, X } from "lucide-react";
import type { GalleryItem } from "@/data/gallery";
import { cacheItems, readCachedItems, readFavorites, recordCopy, recordViewed, toggleFavoriteItem } from "@/lib/visualSource";
import { getActiveAdapters } from "@/lib/sourceAdapters";
import { categoryLabel, normalizeSearch } from "@/lib/labels";

const BATCH = 18;

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
            preload="metadata"
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

      <div className="visual-card-body">
        <h3>{item.title}</h3>
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
  const [visibleCount, setVisibleCount] = useState(BATCH);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selected, setSelected] = useState<GalleryItem | null>(null);
  const sentinel = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        const batches = await Promise.all(getActiveAdapters().map((adapter) => adapter.fetchItems()));
        const merged = batches.flat();
        const seen = new Set<string>();
        const unique = merged.filter((item) => {
          const key = item.prompt.trim().toLowerCase() + "::" + item.mediaUrl;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
        if (!alive) return;
        setItems(unique);
        await cacheItems(unique);
      } catch {
        const cached = await readCachedItems().catch(() => null);
        if (!alive) return;
        if (cached?.items?.length) setItems(cached.items);
        else setError(true);
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    setVisibleCount(BATCH);
  }, [tab, query]);

  const filtered = useMemo(() => {
    const q = normalizeSearch(query);
    return items.filter((item) => {
      if (item.kind !== tab) return false;
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
  }, [items, tab, query]);

  const visible = useMemo(() => filtered.slice(0, visibleCount), [filtered, visibleCount]);

  useEffect(() => {
    const node = sentinel.current;
    if (!node) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) {
        setVisibleCount((count) => Math.min(count + BATCH, filtered.length));
      }
    }, { rootMargin: "700px 0px" });
    observer.observe(node);
    return () => observer.disconnect();
  }, [filtered.length, visibleCount]);

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
          {visibleCount < filtered.length && <div ref={sentinel} className="feed-loader"><span /><span /><span /></div>}
        </>
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
                <a className="source-btn action-button" href={selected.sourceUrl} target="_blank" rel="noreferrer">
                  منبع <ExternalLink size={15} />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
