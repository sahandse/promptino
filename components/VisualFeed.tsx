"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, ExternalLink, Heart, Play, ImageIcon, Video, X, AlertCircle } from "lucide-react";
import type { GalleryItem, SourcePromptPayload, SourcePromptRecord } from "@/data/gallery";

const FAVORITES_KEY = "promptino:media-favorite-items";
const BATCH = 18;
const DATA_URL = "https://raw.githubusercontent.com/benyshen/awesome-image-prompts/main/data/prompts.json";
const RAW_BASE = "https://raw.githubusercontent.com/benyshen/awesome-image-prompts/main/";
const REPO_BASE = "https://github.com/benyshen/awesome-image-prompts/blob/main/";

type MediaTab = "image" | "video";

function readFavorites(): GalleryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const value = JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function detectLanguage(text: string): GalleryItem["language"] {
  if (/[؀-ۿ]/.test(text)) return "fa";
  if (/[A-Za-z]/.test(text)) return "en";
  return "other";
}

function extractUrl(source?: string | null) {
  if (!source) return "";
  const markdown = source.match(/\((https?:\/\/[^)]+)\)/);
  if (markdown?.[1]) return markdown[1];
  const plain = source.match(/https?:\/\/[^\s·]+/);
  return plain?.[0] || "";
}

function isSafePublicItem(record: SourcePromptRecord) {
  const text = [record.title, record.prompt, record.source].filter(Boolean).join(" ").toLowerCase();
  const blocked = [
    "nsfw", "porn", "explicit sexual", "onlyfans", "fanvue",
    "nude", "nudity", "fetish", "成人", "裸", "露骨",
  ];
  return !blocked.some((term) => text.includes(term));
}

function toGalleryItem(record: SourcePromptRecord): GalleryItem | null {
  const prompt = record.prompt?.trim();
  const mediaPath = record.media_type === "video" ? record.video : record.image;

  if (!prompt || !mediaPath || !isSafePublicItem(record)) return null;

  const kind: GalleryItem["kind"] = record.media_type === "video" ? "video" : "image";
  const title = record.title?.trim() || `${kind === "video" ? "ویدیو" : "تصویر"} #${record.id}`;
  const sourceUrl = extractUrl(record.source) || REPO_BASE + mediaPath;
  const category = record.category?.trim() || record.orig_category?.trim() || (kind === "video" ? "video" : "image");

  return {
    id: `source-${record.id}`,
    kind,
    title,
    prompt,
    mediaUrl: RAW_BASE + mediaPath,
    sourceUrl,
    sourceName: record.source?.trim() || "Awesome Image Prompts",
    category,
    tags: [category, kind === "video" ? "ویدیو" : "تصویر"],
    language: detectLanguage(prompt),
  };
}

function VisualCard({ item, onOpen }: { item: GalleryItem; onOpen: (item: GalleryItem) => void }) {
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setSaved(readFavorites().some((savedItem) => savedItem.id === item.id));
  }, [item.id]);

  function toggleFavorite() {
    const current = readFavorites();
    const exists = current.some((savedItem) => savedItem.id === item.id);
    const next = exists
      ? current.filter((savedItem) => savedItem.id !== item.id)
      : [...current, item];

    localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
    setSaved(!exists);
    window.dispatchEvent(new Event("promptino:favorites-changed"));
  }

  async function copyPrompt() {
    await navigator.clipboard.writeText(item.prompt);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <article className="visual-card">
      <div className="visual-media-wrap" onClick={() => onOpen(item)}>
        {item.kind === "video" ? (
          <>
            <video className="visual-media" src={item.mediaUrl} controls playsInline preload="metadata" />
            <span className="media-kind-badge"><Play size={13} /> ویدیو</span>
          </>
        ) : (
          <img className="visual-media" src={item.mediaUrl} alt={item.title} loading="lazy" decoding="async" />
        )}

        <button
          type="button"
          className={saved ? "media-favorite saved" : "media-favorite"}
          onClick={(event) => { event.stopPropagation(); toggleFavorite(); }}
          aria-label={saved ? "حذف از علاقه‌مندی" : "افزودن به علاقه‌مندی"}
        >
          <Heart size={18} fill={saved ? "currentColor" : "none"} />
        </button>
      </div>

      <div className="visual-card-body">
        <div className="visual-meta">
          <span>{item.category}</span>
          <span>{item.language === "fa" ? "FA" : item.language === "en" ? "EN" : "Original"}</span>
        </div>
        <h3>{item.title}</h3>
        <p dir="auto">{item.prompt}</p>

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

export default function VisualFeed({ query = "" }: { query?: string }) {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [tab, setTab] = useState<MediaTab>("image");
  const [visibleCount, setVisibleCount] = useState(BATCH);
  const [loadingSource, setLoadingSource] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [selected, setSelected] = useState<GalleryItem | null>(null);
  const sentinel = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let alive = true;

    fetch(DATA_URL, { cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error("Source unavailable");
        return response.json();
      })
      .then((data: SourcePromptPayload) => {
        if (!alive || !Array.isArray(data.items)) return;
        const realItems = data.items
          .map(toGalleryItem)
          .filter((item): item is GalleryItem => Boolean(item));

        setItems(realItems);
        setLoadError(false);
      })
      .catch(() => {
        if (alive) {
          setItems([]);
          setLoadError(true);
        }
      })
      .finally(() => {
        if (alive) setLoadingSource(false);
      });

    return () => { alive = false; };
  }, []);

  useEffect(() => {
    setVisibleCount(BATCH);
  }, [tab, query]);

  const tabItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((item) => {
      if (item.kind !== tab) return false;
      if (!q) return true;
      return [item.title, item.prompt, item.category, item.sourceName, ...item.tags]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [items, tab, query]);

  const visible = useMemo(
    () => tabItems.slice(0, visibleCount),
    [tabItems, visibleCount],
  );

  useEffect(() => {
    const node = sentinel.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount((current) => Math.min(current + BATCH, tabItems.length));
        }
      },
      { rootMargin: "900px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [tabItems.length, visibleCount]);

  return (
    <section className="visual-feed-section container" id="visual-feed">
      <div className="media-tabs-wrap">
        <div className="media-tabs" role="tablist" aria-label="نوع رسانه">
          <button className={tab === "image" ? "media-tab active" : "media-tab"} onClick={() => setTab("image")}>
            <ImageIcon size={18} /> عکس
          </button>
          <button className={tab === "video" ? "media-tab active" : "media-tab"} onClick={() => setTab("video")}>
            <Video size={18} /> ویدیو
          </button>
        </div>

        <span className="media-count">
          {loadingSource ? "در حال دریافت…" : `${tabItems.length.toLocaleString("fa-IR")} مورد واقعی`}
        </span>
      </div>

      {loadError ? (
        <div className="source-error">
          <AlertCircle size={20} />
          <span>دریافت دیتای واقعی منبع ناموفق بود؛ هیچ داده دمو نمایش داده نمی‌شود.</span>
        </div>
      ) : (
        <>
          <div className="visual-masonry">
            {visible.map((item) => <VisualCard key={item.id} item={item} onOpen={setSelected} />)}
          </div>

          {visibleCount < tabItems.length ? (
            <div ref={sentinel} className="feed-loader" aria-label="بارگذاری بیشتر">
              <span /><span /><span />
            </div>
          ) : !loadingSource && (
            <div className="feed-end">همه موارد واقعی فعلی این بخش بارگذاری شد ✦</div>
          )}
        </>
      )}

      {selected && (
        <div className="media-modal" role="dialog" aria-modal="true" onClick={() => setSelected(null)}>
          <div className="media-modal-card" onClick={(event) => event.stopPropagation()}>
            <button className="media-modal-close" onClick={() => setSelected(null)} aria-label="بستن">
              <X size={20} />
            </button>

            <div className="media-modal-stage">
              {selected.kind === "video" ? (
                <video src={selected.mediaUrl} controls autoPlay playsInline />
              ) : (
                <img src={selected.mediaUrl} alt={selected.title} />
              )}
            </div>

            <div className="media-modal-info">
              <div>
                <span className="model-pill">{selected.category}</span>
                <h3>{selected.title}</h3>
                <p dir="auto">{selected.prompt}</p>
              </div>
              <div className="media-modal-actions">
                <button className="copy-btn" onClick={() => navigator.clipboard.writeText(selected.prompt)}>
                  <Copy size={17} /> کپی پرامپت
                </button>
                <a className="source-btn" href={selected.sourceUrl} target="_blank" rel="noreferrer">
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
