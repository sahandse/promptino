"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, ExternalLink, Heart, Pause, Play, Share2, Volume2, VolumeX } from "lucide-react";
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

          {item.kind === "video" && (
            <button onClick={() => setPaused((value) => !value)}>
              {paused ? <Play size={25} /> : <Pause size={25} />}
              <span>{paused ? "پخش" : "توقف"}</span>
            </button>
          )}

          <button onClick={copyPrompt}>
            {copied ? <Check size={25} /> : <Copy size={25} />}
            <span>{copied ? "کپی شد" : "کپی"}</span>
          </button>

          <button onClick={shareItem}>
            <Share2 size={25} />
            <span>اشتراک</span>
          </button>

          <a href={item.sourceUrl} target="_blank" rel="noreferrer">
            <ExternalLink size={25} />
            <span>منبع</span>
          </a>
        </aside>

        <div className="reels-caption">
          <div className="reels-badges">
            <span>{item.kind === "video" ? "ویدیو" : "عکس"}</span>
            <span>{categoryLabel(item.category)}</span>
            <span>{item.model}</span>
          </div>
          <h2>{item.title}</h2>
          <p dir="auto">{item.prompt}</p>
          <small>{item.sourceName} · Quality {item.qualityScore.toLocaleString("fa-IR")}%</small>
        </div>
      </div>
    </article>
  );
}

export default function ReelsFeed() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    Promise.all(getActiveAdapters().map((adapter) => adapter.fetchItems()))
      .then((batches) => {
        const merged = batches.flat();
        const seen = new Set<string>();
        const unique = merged.filter((item) => {
          const key = `${item.prompt.toLowerCase().trim()}::${item.mediaUrl}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
        setItems(unique);
        setActiveId(unique[0]?.id || null);
      })
      .catch(() => setError(true));
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
  }, [items]);

  const ordered = useMemo(
    () => [...items].sort((a, b) => b.likes - a.likes || b.qualityScore - a.qualityScore),
    [items],
  );

  if (error) {
    return <div className="reels-empty">دریافت فید واقعی ناموفق بود؛ داده دمو نمایش داده نمی‌شود.</div>;
  }

  return (
    <div className="reels-feed" ref={containerRef}>
      {ordered.map((item) => (
        <ReelsSlide key={item.id} item={item} active={activeId === item.id} />
      ))}
      {!ordered.length && <div className="reels-loading">در حال دریافت فید واقعی…</div>}
    </div>
  );
}
