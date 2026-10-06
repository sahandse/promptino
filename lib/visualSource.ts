import type { GalleryItem, VisualFeedPayload, VisualFeedRecord } from "@/data/gallery";

export const VISUAL_SOURCE_URL =
  "https://raw.githubusercontent.com/Hanyuyu/visual-prompt-feed/main/data/prompts.json";

export const FAVORITES_KEY = "promptino:media-favorite-items-v3";
export const HISTORY_KEY = "promptino:copy-history-v1";
export const REPORTS_KEY = "promptino:reported-items-v1";
export const CACHE_DB = "promptino-cache";
export const CACHE_STORE = "feeds";
export const CACHE_KEY = "visual-feed-v1";

export type CopyHistoryItem = {
  id: string;
  title: string;
  prompt: string;
  copiedAt: string;
};

export function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const value = JSON.parse(localStorage.getItem(key) || "");
    return (value ?? fallback) as T;
  } catch {
    return fallback;
  }
}

export function writeJson<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

export function recordCopy(item: GalleryItem) {
  const current = readJson<CopyHistoryItem[]>(HISTORY_KEY, []);
  const next = [
    { id: item.id, title: item.title, prompt: item.prompt, copiedAt: new Date().toISOString() },
    ...current.filter((entry) => entry.id !== item.id),
  ].slice(0, 80);
  writeJson(HISTORY_KEY, next);
  window.dispatchEvent(new Event("promptino:history-changed"));
}

export function readFavorites(): GalleryItem[] {
  return readJson<GalleryItem[]>(FAVORITES_KEY, []);
}

export function toggleFavoriteItem(item: GalleryItem) {
  const current = readFavorites();
  const exists = current.some((saved) => saved.id === item.id);
  const next = exists ? current.filter((saved) => saved.id !== item.id) : [...current, item];
  writeJson(FAVORITES_KEY, next);
  window.dispatchEvent(new Event("promptino:favorites-changed"));
  return !exists;
}

function resultMedia(record: VisualFeedRecord) {
  return (
    record.media.find((media) => media.type === record.mediaType && media.role === "result") ||
    record.media.find((media) => media.type === record.mediaType)
  );
}

export function isVerifiedRecord(record: VisualFeedRecord) {
  const media = resultMedia(record);
  return Boolean(
    record.id &&
      /^byradar:\d+:\d+$/.test(record.id) &&
      record.title?.trim() &&
      record.prompt?.trim() &&
      record.source?.url?.startsWith("https://x.com/") &&
      record.source?.author?.handle?.trim() &&
      record.categories?.length &&
      record.recommendedModel?.trim() &&
      media?.previewUrl
  );
}

export function isSafePublicRecord(record: VisualFeedRecord) {
  const text = [record.title, record.prompt, ...record.tags, ...record.categories].join(" ").toLowerCase();
  const blocked = [
    "nsfw","porn","explicit sexual","nude","nudity","fetish","onlyfans","fanvue",
    "lingerie","bikini","cleavage","成人","色情","情趣","内衣","比基尼",
  ];
  return !blocked.some((term) => text.includes(term));
}

export function toGalleryItem(record: VisualFeedRecord): GalleryItem | null {
  if (!isVerifiedRecord(record) || !isSafePublicRecord(record)) return null;
  const media = resultMedia(record);
  if (!media) return null;

  return {
    id: record.id,
    kind: record.mediaType,
    title: record.title.trim(),
    prompt: record.prompt.trim(),
    mediaUrl: media.previewUrl,
    posterUrl: media.posterUrl,
    sourceUrl: record.source.url,
    sourceName: record.source.author.handle ? `@${record.source.author.handle}` : record.source.attribution,
    model: record.recommendedModel,
    category: record.categories[0],
    categories: record.categories,
    tags: record.tags,
    language: record.language || "original",
    publishedAt: record.source.publishedAt || null,
    likes: record.source.engagement?.likes ?? 0,
    sourceLicense: record.source.license,
    rightsHolder: record.source.rightsHolder,
    providerId: "visual-prompt-feed",
    providerName: "Visual Prompt Feed",
    translatedPrompt: null,
  };
}

export function transformPayload(payload: VisualFeedPayload) {
  return (payload.items || []).map(toGalleryItem).filter((item): item is GalleryItem => Boolean(item));
}

export function openCache(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(CACHE_DB, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(CACHE_STORE)) {
        request.result.createObjectStore(CACHE_STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function cacheItems(items: GalleryItem[]) {
  const db = await openCache();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(CACHE_STORE, "readwrite");
    tx.objectStore(CACHE_STORE).put({ items, syncedAt: new Date().toISOString() }, CACHE_KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export async function readCachedItems(): Promise<{ items: GalleryItem[]; syncedAt: string } | null> {
  const db = await openCache();
  const value = await new Promise<{ items: GalleryItem[]; syncedAt: string } | undefined>((resolve, reject) => {
    const tx = db.transaction(CACHE_STORE, "readonly");
    const request = tx.objectStore(CACHE_STORE).get(CACHE_KEY);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  db.close();
  return value || null;
}
