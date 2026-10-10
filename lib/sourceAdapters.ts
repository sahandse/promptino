import type { GalleryItem, VisualFeedPayload } from "@/data/gallery";
import { transformPayload, VISUAL_SOURCE_URL } from "@/lib/visualSource";

export type SourceAdapter = {
  id: string;
  name: string;
  endpoint: string;
  active: boolean;
  fetchItems: () => Promise<GalleryItem[]>;
};

type PublicRegistryRecord = {
  id: string;
  sourceId: string;
  title: string;
  prompt: string;
  description: string;
  coverUrl: string;
  referenceImageUrls: string[];
  tags: string[];
  author: string;
  sourceUrl: string;
  createdAt: string;
  imageMode: string;
  imageModel: string;
};

export const PUBLIC_REGISTRY_URL =
  "https://raw.githubusercontent.com/yukkcat/image-prompts/main/dist/prompts.json";

function isSafeRegistryRecord(record: PublicRegistryRecord) {
  const text = [record.title, record.prompt, record.description, ...record.tags]
    .join(" ")
    .toLowerCase();

  const blocked = [
    "nsfw", "porn", "explicit sexual", "nude", "nudity", "fetish",
    "lingerie", "bikini", "cleavage",
    "suicide", "self-harm", "self harm",
    "gun tutorial", "weapon tutorial", "explosive tutorial", "bomb making",
    "drug use tutorial", "cocaine", "heroin", "methamphetamine",
    "gambling strategy", "casino exploit", "dangerous challenge",
  ];

  return !blocked.some((term) => text.includes(term));
}

function registryItem(record: PublicRegistryRecord): GalleryItem | null {
  const mediaUrl = record.coverUrl || record.referenceImageUrls?.[0] || "";
  if (
    !record.id?.trim() ||
    !record.title?.trim() ||
    !record.prompt?.trim() ||
    !mediaUrl.startsWith("http") ||
    !record.sourceUrl?.startsWith("http") ||
    !isSafeRegistryRecord(record)
  ) {
    return null;
  }

  const tags = Array.isArray(record.tags) ? record.tags.filter(Boolean) : [];
  const category = tags[0] || "Public";
  const qualityScore = Math.min(
    100,
    48 +
      (record.prompt.length > 80 ? 12 : 0) +
      (tags.length >= 2 ? 10 : 0) +
      (record.author ? 8 : 0) +
      (record.createdAt ? 6 : 0) +
      (record.imageModel ? 8 : 0) +
      (mediaUrl ? 8 : 0),
  );

  return {
    id: `registry:${record.id}`,
    kind: "image",
    title: record.title.trim(),
    prompt: record.prompt.trim(),
    mediaUrl,
    posterUrl: null,
    sourceUrl: record.sourceUrl,
    sourceName: record.author || record.sourceId,
    model: record.imageModel || "Image",
    category,
    categories: tags.length ? tags.slice(0, 6) : ["Public"],
    tags,
    language: "original",
    publishedAt: record.createdAt || null,
    likes: 0,
    sourceLicense: "check-upstream",
    rightsHolder: record.author || record.sourceId,
    providerId: "image-prompts-registry",
    providerName: "Public Prompt Registry",
    translatedPrompt: null,
    qualityScore,
  };
}

async function fetchVisualPromptFeed() {
  const response = await fetch(VISUAL_SOURCE_URL, { cache: "no-store" });
  if (!response.ok) throw new Error(`visual-prompt-feed: ${response.status}`);
  const payload = (await response.json()) as VisualFeedPayload;
  return transformPayload(payload);
}

async function fetchPublicPromptRegistry() {
  const response = await fetch(PUBLIC_REGISTRY_URL, { cache: "no-store" });
  if (!response.ok) throw new Error(`image-prompts-registry: ${response.status}`);
  const payload = (await response.json()) as PublicRegistryRecord[];
  return (Array.isArray(payload) ? payload : [])
    .map(registryItem)
    .filter((item): item is GalleryItem => Boolean(item));
}

export const sourceAdapters: SourceAdapter[] = [
  {
    id: "visual-prompt-feed",
    name: "Visual Prompt Feed",
    endpoint: VISUAL_SOURCE_URL,
    active: true,
    fetchItems: fetchVisualPromptFeed,
  },
  {
    id: "image-prompts-registry",
    name: "Public Prompt Registry",
    endpoint: PUBLIC_REGISTRY_URL,
    active: true,
    fetchItems: fetchPublicPromptRegistry,
  },
];

export function getActiveAdapters() {
  return sourceAdapters.filter((adapter) => adapter.active);
}
