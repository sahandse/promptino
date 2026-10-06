import type { GalleryItem, VisualFeedPayload } from "@/data/gallery";
import { transformPayload, VISUAL_SOURCE_URL } from "@/lib/visualSource";

export type SourceAdapter = {
  id: string;
  name: string;
  endpoint: string;
  active: boolean;
  fetchItems: () => Promise<GalleryItem[]>;
};

async function fetchVisualPromptFeed() {
  const response = await fetch(VISUAL_SOURCE_URL, { cache: "no-store" });
  if (!response.ok) throw new Error(`visual-prompt-feed: ${response.status}`);
  const payload = (await response.json()) as VisualFeedPayload;
  return transformPayload(payload);
}

export const sourceAdapters: SourceAdapter[] = [
  {
    id: "visual-prompt-feed",
    name: "Visual Prompt Feed",
    endpoint: VISUAL_SOURCE_URL,
    active: true,
    fetchItems: fetchVisualPromptFeed,
  },
];

export function getActiveAdapters() {
  return sourceAdapters.filter((adapter) => adapter.active);
}
