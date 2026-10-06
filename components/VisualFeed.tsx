"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle, Check, Copy, ExternalLink, Heart, ImageIcon, Play, Video, X,
  BadgeCheck, Flag, Link2, Clock3, Flame, Bookmark, History, RefreshCw, SlidersHorizontal,
} from "lucide-react";
import type { GalleryItem } from "@/data/gallery";
import {
  FAVORITES_KEY, HISTORY_KEY, REPORTS_KEY,
  cacheItems, readCachedItems, readFavorites, readJson, recordCopy,
  toggleFavoriteItem, writeJson,
} from "@/lib/visualSource";
import { getActiveAdapters } from "@/lib/sourceAdapters";

const BATCH = 18;

type MediaTab = "image" | "video";
type FeedMode = "all" | "new" | "popular" | "saved" | "history";

function formatSyncTime(value: string | null) {
  if (!value) return "—";
  try {
    return new Intl.DateTimeFormat("fa-IR", {
      month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function VisualCard({
  item,
  onOpen,
}: {
  item: GalleryItem;
  onOpen: (item: GalleryItem) => void;
}) {
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const sync = () => setSaved(readFavorites().some((savedItem) => savedItem.id === item.id));
    sync();
    window.addEventListener("promptino:favorites-changed", sync);
    return () => window.removeEventListener("promptino:favorites-changed", sync);
  }, [item.id]);

  function toggleFavorite() {
    setSaved(toggleFavoriteItem(item));
  }

  async function copyPrompt() {
    await navigator.clipboard.writeText(item.prompt);
    recordCopy(item);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <article className="visual-card">
      <div className="visual-media-wrap" onClick={() => onOpen(item)}>
        {item.kind === "video" ? (
          <>
            <video
              className="visual-media"
              src={item.mediaUrl}
              poster={item.posterUrl || undefined}
              controls
              playsInline
              preload="metadata"
              onClick={(event) => event.stopPropagation()}
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
          onClick={(event) => { event.stopPropagation(); toggleFavorite(); }}
          aria-label={saved ? "حذف از علاقه‌مندی" : "افزودن به علاقه‌مندی"}
        >
          <Heart size={18} fill={saved ? "currentColor" : "none"} />
        </button>
      </div>

      <div className="visual-card-body">
        <div className="visual-meta">
          <span className="verified-label"><BadgeCheck size={12} /> Source Matched</span>
          <span>{item.language.toUpperCase()}</span>
        </div>

        <h3>{item.title}</h3>
        <p dir="auto">{item.prompt}</p>

        <div className="visual-tags">
          <span>{item.model}</span>
          <span>{item.category}</span>
        </div>

        <div className="visual-actions">
          <button type="button" className="copy-btn" onClick={copyPrompt}>
            {copied ? <Check size={17} /> : <Copy size={17} />}
            {copied ? "کپی شد" : "کپی اصل"}
          </button>
          <button type="button" className="source-btn" onClick={() => onOpen(item)}>
            جزئیات
          </button>
        </div>
      </div>
    </article>
  );
}

function SkeletonFeed() {
  return (
    <div className="visual-masonry skeleton-feed" aria-hidden="true">
      {Array.from({ length: 12 }).map((_, index) => (
        <div className="visual-card skeleton-card" key={index}>
          <div className="skeleton-media" />
          <div className="visual-card-body">
            <div className="skeleton-line short" />
            <div className="skeleton-line" />
            <div className="skeleton-line" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function VisualFeed({ query = "" }: { query?: string }) {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [tab, setTab] = useState<MediaTab>("image");
  const [mode, setMode] = useState<FeedMode>("all");
  const [visibleCount, setVisibleCount] = useState(BATCH);
  const [loadingSource, setLoadingSource] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [selected, setSelected] = useState<GalleryItem | null>(null);
  const [syncedAt, setSyncedAt] = useState<string | null>(null);
  const [category, setCategory] = useState("all");
  const [model, setModel] = useState("all");
  const [language, setLanguage] = useState("all");
  const [provider, setProvider] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [refreshToken, setRefreshToken] = useState(0);
  const [localRevision, setLocalRevision] = useState(0);
  const sentinel = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoadingSource(true);
      setLoadError(false);

      try {
        const adapters = getActiveAdapters();
        const batches = await Promise.all(adapters.map((adapter) => adapter.fetchItems()));
        const realItems = batches.flat();

        if (!alive) return;
        setItems(realItems);
        const now = new Date().toISOString();
        setSyncedAt(now);
        await cacheItems(realItems);
      } catch {
        try {
          const cached = await readCachedItems();
          if (!alive) return;
          if (cached?.items?.length) {
            setItems(cached.items);
            setSyncedAt(cached.syncedAt);
            setLoadError(false);
          } else {
            setItems([]);
            setLoadError(true);
          }
        } catch {
          if (alive) {
            setItems([]);
            setLoadError(true);
          }
        }
      } finally {
        if (alive) setLoadingSource(false);
      }
    }

    load();
    return () => { alive = false; };
  }, [refreshToken]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const itemId = params.get("item");
    if (!itemId || !items.length) return;
    const found = items.find((item) => item.id === itemId);
    if (found) setSelected(found);
  }, [items]);

  useEffect(() => {
    setVisibleCount(BATCH);
  }, [tab, query, mode, category, model, language, provider]);

  const categories = useMemo(
    () => Array.from(new Set(items.filter((item) => item.kind === tab).flatMap((item) => item.categories))).sort(),
    [items, tab],
  );
  const models = useMemo(
    () => Array.from(new Set(items.filter((item) => item.kind === tab).map((item) => item.model))).sort(),
    [items, tab],
  );
  const languages = useMemo(
    () => Array.from(new Set(items.filter((item) => item.kind === tab).map((item) => item.language))).sort(),
    [items, tab],
  );
  const providers = useMemo(
    () => Array.from(new Map(items.map((item) => [item.providerId, item.providerName])).entries()),
    [items],
  );

  const tabItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    const savedIds = new Set(readFavorites().map((item) => item.id));
    const historyIds = new Set(readJson<{ id: string }[]>(HISTORY_KEY, []).map((item) => item.id));

    let result = items.filter((item) => {
      if (item.kind !== tab) return false;
      if (category !== "all" && !item.categories.includes(category)) return false;
      if (model !== "all" && item.model !== model) return false;
      if (language !== "all" && item.language !== language) return false;
      if (provider !== "all" && item.providerId !== provider) return false;
      if (mode === "saved" && !savedIds.has(item.id)) return false;
      if (mode === "history" && !historyIds.has(item.id)) return false;
      if (!q) return true;

      return [
        item.title, item.prompt, item.model, item.category,
        item.sourceName, ...item.categories, ...item.tags,
      ].join(" ").toLowerCase().includes(q);
    });

    if (mode === "new") {
      result = [...result].sort((a, b) =>
        new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime()
      );
    } else if (mode === "popular") {
      result = [...result].sort((a, b) => b.likes - a.likes);
    } else if (mode === "history") {
      const history = readJson<{ id: string; copiedAt: string }[]>(HISTORY_KEY, []);
      const order = new Map(history.map((entry, index) => [entry.id, index]));
      result = [...result].sort((a, b) => (order.get(a.id) ?? 9999) - (order.get(b.id) ?? 9999));
    }

    return result;
  }, [items, tab, query, mode, category, model, language, provider, localRevision]);

  const visible = useMemo(() => tabItems.slice(0, visibleCount), [tabItems, visibleCount]);

  useEffect(() => {
    const sync = () => setLocalRevision((value) => value + 1);
    window.addEventListener("promptino:favorites-changed", sync);
    window.addEventListener("promptino:history-changed", sync);
    return () => {
      window.removeEventListener("promptino:favorites-changed", sync);
      window.removeEventListener("promptino:history-changed", sync);
    };
  }, []);

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

  function openItem(item: GalleryItem) {
    setSelected(item);
    const url = new URL(window.location.href);
    url.searchParams.set("item", item.id);
    window.history.replaceState({}, "", url);
  }

  function closeItem() {
    setSelected(null);
    const url = new URL(window.location.href);
    url.searchParams.delete("item");
    window.history.replaceState({}, "", url);
  }

  async function copyLink(item: GalleryItem) {
    const url = new URL(window.location.href);
    url.searchParams.set("item", item.id);
    await navigator.clipboard.writeText(url.toString());
  }

  function reportItem(item: GalleryItem) {
    const reports = readJson<string[]>(REPORTS_KEY, []);
    if (!reports.includes(item.id)) writeJson(REPORTS_KEY, [...reports, item.id]);

    const title = encodeURIComponent(`Prompt/media mapping report: ${item.id}`);
    const body = encodeURIComponent(
      `Item ID: ${item.id}\nSource: ${item.sourceUrl}\n\nPlease verify that the prompt belongs to this exact media item.`
    );
    window.open(
      `https://github.com/sahandse/promptino/issues/new?title=${title}&body=${body}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  async function copySelected(item: GalleryItem) {
    await navigator.clipboard.writeText(item.prompt);
    recordCopy(item);
  }

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

        <div className="sync-status">
          <BadgeCheck size={14} />
          <span>{tabItems.length.toLocaleString("fa-IR")} مورد</span>
          <span>آخرین همگام‌سازی: {formatSyncTime(syncedAt)}</span>
          <button onClick={() => setRefreshToken((value) => value + 1)} aria-label="همگام‌سازی مجدد">
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      <div className="feed-mode-row">
        {([
          ["all", "همه", <SlidersHorizontal size={14} key="a" />],
          ["new", "جدید", <Clock3 size={14} key="n" />],
          ["popular", "محبوب", <Flame size={14} key="p" />],
          ["saved", "ذخیره‌شده", <Bookmark size={14} key="s" />],
          ["history", "کپی‌های اخیر", <History size={14} key="h" />],
        ] as [FeedMode, string, React.ReactNode][]).map(([value, label, icon]) => (
          <button key={value} className={mode === value ? "feed-mode active" : "feed-mode"} onClick={() => setMode(value)}>
            {icon}{label}
          </button>
        ))}
        <button className={showFilters ? "feed-mode active filter-toggle" : "feed-mode filter-toggle"} onClick={() => setShowFilters((value) => !value)}>
          <SlidersHorizontal size={14} /> فیلتر
        </button>
      </div>

      {showFilters && (
        <div className="advanced-filters">
          <label>دسته‌بندی
            <select value={category} onChange={(event) => setCategory(event.target.value)}>
              <option value="all">همه</option>
              {categories.map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
          </label>
          <label>مدل
            <select value={model} onChange={(event) => setModel(event.target.value)}>
              <option value="all">همه</option>
              {models.map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
          </label>
          <label>زبان
            <select value={language} onChange={(event) => setLanguage(event.target.value)}>
              <option value="all">همه</option>
              {languages.map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
          </label>
          <label>منبع
            <select value={provider} onChange={(event) => setProvider(event.target.value)}>
              <option value="all">همه منابع فعال</option>
              {providers.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
            </select>
          </label>
        </div>
      )}

      {loadingSource && !items.length ? (
        <SkeletonFeed />
      ) : loadError ? (
        <div className="source-error">
          <AlertCircle size={20} />
          <span>منبع واقعی در دسترس نیست و کش معتبر قبلی هم وجود ندارد؛ هیچ داده دمو نمایش داده نمی‌شود.</span>
        </div>
      ) : (
        <>
          <div className="visual-masonry">
            {visible.map((item) => <VisualCard key={item.id} item={item} onOpen={openItem} />)}
          </div>

          {!visible.length && (
            <div className="feed-empty">موردی با این فیلتر پیدا نشد.</div>
          )}

          {visibleCount < tabItems.length ? (
            <div ref={sentinel} className="feed-loader" aria-label="بارگذاری بیشتر">
              <span /><span /><span />
            </div>
          ) : !loadingSource && visible.length > 0 && (
            <div className="feed-end">همه موارد واقعی این بخش بارگذاری شد ✦</div>
          )}
        </>
      )}

      {selected && (
        <div className="media-modal" role="dialog" aria-modal="true" onClick={closeItem}>
          <div className="media-modal-card" onClick={(event) => event.stopPropagation()}>
            <button className="media-modal-close" onClick={closeItem} aria-label="بستن">
              <X size={20} />
            </button>

            <div className="media-modal-stage">
              {selected.kind === "video" ? (
                <video
                  src={selected.mediaUrl}
                  poster={selected.posterUrl || undefined}
                  controls
                  autoPlay
                  playsInline
                />
              ) : (
                <img src={selected.mediaUrl} alt={selected.title} />
              )}
            </div>

            <div className="media-modal-info">
              <div>
                <div className="detail-badges">
                  <span className="verified-badge"><BadgeCheck size={13} /> Verified Source</span>
                  <span className="model-pill">{selected.language.toUpperCase()}</span>
                  <span className="model-pill">{selected.model}</span>
                </div>

                <h3>{selected.title}</h3>
                <p className="full-prompt" dir="auto">{selected.prompt}</p>

                <div className="detail-meta-list">
                  <span>دسته: {selected.categories.join("، ")}</span>
                  <span>نویسنده: {selected.sourceName}</span>
                  <span>حقوق منبع: {selected.sourceLicense}</span>
                  <span>ID: {selected.id}</span>
                </div>
              </div>

              <div className="media-modal-actions stacked-actions">
                <button className="copy-btn" onClick={() => copySelected(selected)}>
                  <Copy size={17} /> کپی پرامپت اصلی
                </button>
                {selected.translatedPrompt && (
                  <button
                    className="source-btn action-button"
                    onClick={() => navigator.clipboard.writeText(selected.translatedPrompt || "")}
                  >
                    <Copy size={15} /> کپی ترجمه معتبر
                  </button>
                )}
                <button className="source-btn action-button" onClick={() => copyLink(selected)}>
                  <Link2 size={15} /> کپی لینک
                </button>
                <a className="source-btn action-button" href={selected.sourceUrl} target="_blank" rel="noreferrer">
                  منبع اصلی <ExternalLink size={15} />
                </a>
                <button className="source-btn action-button danger-action" onClick={() => reportItem(selected)}>
                  <Flag size={15} /> گزارش پرامپت اشتباه
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
