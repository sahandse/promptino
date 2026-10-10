"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, Heart, ImageIcon, Play, Share2, Video, Volume2, VolumeX } from "lucide-react";
import type { GalleryItem } from "@/data/gallery";
import { getActiveAdapters } from "@/lib/sourceAdapters";
import { readFavorites, recordCopy, recordViewed, toggleFavoriteItem } from "@/lib/visualSource";
import { categoryLabel } from "@/lib/labels";

function ReelsVideo({
  item,
  active,
  muted,
  paused,
  onToggle,
  onBroken,
}: {
  item: GalleryItem;
  active: boolean;
  muted: boolean;
  paused: boolean;
  onToggle: () => void;
  onBroken: () => void;
}) {
  const ref = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (active && !paused) {
      video.play().catch(() => undefined);
    } else {
      video.pause();
      if (!active) video.currentTime = 0;
    }
  }, [active, paused]);

  return (
    <video
      ref={ref}
      className="reels-media"
      src={item.mediaUrl}
      poster={item.posterUrl || undefined}
      muted={muted}
      loop
      playsInline
      preload="metadata"
      onError={onBroken}
      onClick={onToggle}
    />
  );
}

function ReelsSlide({
  item,
  active,
}: {
  item: GalleryItem;
  active: boolean;
}) {
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [muted, setMuted] = useState(true);
  const [paused, setPaused] = useState(false);
  const [broken, setBroken] = useState(false);

  useEffect(() => {
    const sync = () => setSaved(readFavorites().some((savedItem) => savedItem.id === item.id));
    sync();
    window.addEventListener("promptino:favorites-changed", sync);
    return () => window.removeEventListener("promptino:favorites-changed", sync);
  }, [item.id]);

  useEffect(() => {
    if (active) {
      recordViewed(item);
      setPaused(false);
    } else {
      setPaused(false);
    }
  }, [active, item]);

  async function copyPrompt() {
    await navigator.clipboard.writeText(item.prompt);
    recordCopy(item);
    setCopied(true);
    navigator.vibrate?.(8);
    window.setTimeout(() => setCopied(false), 1300);
  }

  async function shareItem() {
    const url = new URL(window.location.href);
    url.searchParams.set("item", item.id);
    if (navigator.share) {
      await navigator.share({
        title: item.title,
        text: item.prompt.slice(0, 160),
        url: url.toString(),
      }).catch(() => undefined);
    } else {
      await navigator.clipboard.writeText(url.toString());
    }
  }

  if (broken) return null;

  return (
    <article className="reels-slide" data-reel-id={item.id}>
      <div className="reels-stage">
        {item.kind === "video" ? (
          <ReelsVideo
            item={item}
            active={active}
            muted={muted}
            paused={paused}
            onToggle={() => {
              navigator.vibrate?.(6);
              setPaused((value) => !value);
            }}
            onBroken={() => setBroken(true)}
          />
        ) : (
          <img
            className="reels-media"
            src={item.mediaUrl}
            alt={item.title}
            loading="lazy"
            onError={() => setBroken(true)}
          />
        )}

        <div className="reels-gradient" />

        {item.kind === "video" && paused && (
          <button
            className="reels-play"
            onClick={() => setPaused(false)}
            aria-label="پخش ویدیو"
          >
            <Play size={34} fill="currentColor" />
          </button>
        )}

        {item.kind === "video" && (
          <button className="reels-sound" onClick={() => setMuted((value) => !value)} aria-label="صدا">
            {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
        )}

        <aside className="reels-actions">
          <button
            className={saved ? "active" : ""}
            onClick={() => {
              navigator.vibrate?.(10);
              setSaved(toggleFavoriteItem(item));
            }}
          >
            <Heart size={25} fill={saved ? "currentColor" : "none"} />
            <span>ذخیره</span>
          </button>

          <button onClick={copyPrompt}>
            {copied ? <Check size={25} /> : <Copy size={25} />}
            <span>{copied ? "کپی شد" : "کپی"}</span>
          </button>

          <button onClick={shareItem}>
            <Share2 size={25} />
            <span>اشتراک</span>
          </button>

        </aside>

        <div className="reels-caption">
          <div className="reels-badges">
            <span>{categoryLabel(item.category)}</span>
          </div>
          <h2>{item.title}</h2>
          <p dir="auto">{item.prompt}</p>
        </div>
      </div>
    </article>
  );
}

const REELS_BATCH = 18;

export default function ReelsFeed() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [visibleCount, setVisibleCount] = useState(REELS_BATCH);
  const [filter, setFilter] = useState<"all" | "image" | "video">("all");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let alive = true;
    const adapters = getActiveAdapters();
    const merged = new Map<string, GalleryItem>();

    const publish = (batch: GalleryItem[]) => {
      for (const item of batch) {
        const key = `${item.prompt.toLowerCase().trim()}::${item.mediaUrl}`;
        if (!merged.has(key)) merged.set(key, item);
      }
      if (!alive) return;
      const unique = [...merged.values()];
      setItems(unique);
      setActiveId((current) => current || unique[0]?.id || null);
    };

    async function load() {
      try {
        if (!adapters.length) throw new Error("No public source available");
        const primary = await adapters[0].fetchItems();
        publish(primary);

        const loadMore = async () => {
          const results = await Promise.allSettled(adapters.slice(1).map((adapter) => adapter.fetchItems()));
          if (!alive) return;
          for (const result of results) {
            if (result.status === "fulfilled" && result.value.length) publish(result.value);
          }
        };

        if ("requestIdleCallback" in window) {
          (window as Window & { requestIdleCallback: (callback: () => void, options?: { timeout: number }) => number })
            .requestIdleCallback(() => { void loadMore(); }, { timeout: 2200 });
        } else {
          window.setTimeout(() => { void loadMore(); }, 900);
        }
      } catch {
        if (alive) setError(true);
      }
    }

    void load();
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    const root = containerRef.current;
    if (!root || !items.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const best = [...entries]
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        const id = (best?.target as HTMLElement | undefined)?.dataset.reelId;
        if (id) setActiveId(id);
      },
      { root, threshold: [0.45, 0.65, 0.85] },
    );

    root.querySelectorAll<HTMLElement>("[data-reel-id]").forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [items, filter, visibleCount]);

  const orderedAll = useMemo(() => {
    const filtered = filter === "all" ? items : items.filter((item) => item.kind === filter);
    return [...filtered].sort((a, b) => b.likes - a.likes || b.qualityScore - a.qualityScore);
  }, [items, filter]);

  const ordered = useMemo(() => orderedAll.slice(0, visibleCount), [orderedAll, visibleCount]);

  useEffect(() => {
    if (!activeId || visibleCount >= orderedAll.length) return;
    const index = ordered.findIndex((item) => item.id === activeId);
    if (index >= ordered.length - 4) {
      setVisibleCount((count) => Math.min(count + REELS_BATCH, orderedAll.length));
    }
  }, [activeId, ordered, orderedAll.length, visibleCount]);

  useEffect(() => {
    setVisibleCount(REELS_BATCH);
    setActiveId(null);
    containerRef.current?.scrollTo({ top: 0, behavior: "auto" });
  }, [filter]);

  if (error) {
    return <div className="reels-empty">دریافت فید واقعی ناموفق بود؛ داده دمو نمایش داده نمی‌شود.</div>;
  }

  return (
    <div className="reels-shell">
      <div className="reels-filter" role="tablist" aria-label="نوع ریلز">
        <button className={filter === "all" ? "active" : ""} onClick={() => { setFilter("all"); setActiveId(null); }}>
          همه
        </button>
        <button className={filter === "image" ? "active" : ""} onClick={() => { setFilter("image"); setActiveId(null); }}>
          <ImageIcon size={15} /> عکس
        </button>
        <button className={filter === "video" ? "active" : ""} onClick={() => { setFilter("video"); setActiveId(null); }}>
          <Video size={15} /> ویدیو
        </button>
      </div>
      <div className="reels-feed" ref={containerRef}>
      {ordered.map((item) => (
        <ReelsSlide key={item.id} item={item} active={activeId === item.id} />
      ))}
      {!ordered.length && <div className="reels-loading">موردی در این بخش وجود ندارد.</div>}
      </div>
    </div>
  );
}
