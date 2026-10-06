"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, ExternalLink, Heart, Play, ImageIcon, Video, X } from "lucide-react";
import { galleryItems, type GalleryItem } from "@/data/gallery";

const FAVORITES_KEY = "promptino:media-favorite-items";
const BATCH = 18;
const TREE_URL = "https://api.github.com/repos/benyshen/awesome-image-prompts/git/trees/main?recursive=1";
const RAW_BASE = "https://raw.githubusercontent.com/benyshen/awesome-image-prompts/main/";
const BLOB_BASE = "https://github.com/benyshen/awesome-image-prompts/blob/main/";

type TreeEntry = { path?: string; type?: string };
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

function makeItem(path: string): GalleryItem {
  const isVideo = path.startsWith("videos/");
  const filename = path.split("/").pop() || path;
  const id = `source-${path.replace(/[^a-zA-Z0-9]+/g, "-")}`;

  return {
    id,
    kind: isVideo ? "video" : "image",
    title: isVideo
      ? `ویدیوی AI — ${filename.replace(/\.mp4$/i, "")}`
      : `تصویر AI — ${filename.replace(/\.(jpg|jpeg|png|webp)$/i, "")}`,
    prompt: isVideo
      ? "با الهام از این نمونه، یک ویدیوی تازه برای [موضوع شما] با حرکت دوربین طبیعی، نورپردازی حرفه‌ای، جزئیات واقعی و بدون متن روی تصویر تولید کن."
      : "با الهام از این نمونه، یک تصویر تازه برای [موضوع شما] با ترکیب‌بندی حرفه‌ای، نورپردازی دقیق، جزئیات طبیعی و بدون نوشته یا واترمارک تولید کن.",
    mediaUrl: RAW_BASE + path,
    sourceUrl: BLOB_BASE + path,
    sourceName: "Awesome Image Prompts",
    model: isVideo ? "Video AI" : "Image AI",
    tags: isVideo ? ["ویدیو", "AI", "الهام"] : ["تصویر", "AI", "الهام"],
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
          <span>{item.model}</span>
          <span>{item.kind === "video" ? "ویدیو" : "تصویر"}</span>
        </div>
        <h3>{item.title}</h3>
        <p>{item.prompt}</p>

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
  const [items, setItems] = useState<GalleryItem[]>(galleryItems);
  const [tab, setTab] = useState<MediaTab>("image");
  const [visibleCount, setVisibleCount] = useState(BATCH);
  const [loadingSource, setLoadingSource] = useState(true);
  const [selected, setSelected] = useState<GalleryItem | null>(null);
  const sentinel = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let alive = true;

    fetch(TREE_URL, { headers: { Accept: "application/vnd.github+json" } })
      .then((response) => {
        if (!response.ok) throw new Error("GitHub source unavailable");
        return response.json();
      })
      .then((data: { tree?: TreeEntry[] }) => {
        if (!alive || !Array.isArray(data.tree)) return;

        const paths = data.tree
          .filter((entry) => entry.type === "blob" && typeof entry.path === "string")
          .map((entry) => entry.path as string)
          .filter((path) =>
            /^images\/.+\.(jpg|jpeg|png|webp)$/i.test(path) ||
            /^videos\/.+\.mp4$/i.test(path),
          );

        if (paths.length) setItems(paths.map(makeItem));
      })
      .catch(() => {})
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
      return [item.title, item.prompt, item.model, item.sourceName, ...item.tags]
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
          <button
            className={tab === "image" ? "media-tab active" : "media-tab"}
            onClick={() => setTab("image")}
          >
            <ImageIcon size={18} />
            عکس
          </button>
          <button
            className={tab === "video" ? "media-tab active" : "media-tab"}
            onClick={() => setTab("video")}
          >
            <Video size={18} />
            ویدیو
          </button>
        </div>

        <span className="media-count">
          {loadingSource ? "در حال دریافت…" : `${tabItems.length.toLocaleString("fa-IR")} مورد`}
        </span>
      </div>

      <div className="visual-masonry">
        {visible.map((item) => <VisualCard key={item.id} item={item} onOpen={setSelected} />)}
      </div>

      {visibleCount < tabItems.length ? (
        <div ref={sentinel} className="feed-loader" aria-label="بارگذاری بیشتر">
          <span /><span /><span />
        </div>
      ) : (
        <div className="feed-end">همه موارد فعلی این بخش بارگذاری شد ✦</div>
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
                <span className="model-pill">{selected.model}</span>
                <h3>{selected.title}</h3>
                <p>{selected.prompt}</p>
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
