export type GalleryItem = {
  id: string;
  kind: "image" | "video";
  title: string;
  prompt: string;
  mediaUrl: string;
  posterUrl?: string | null;
  sourceUrl: string;
  sourceName: string;
  model: string;
  category: string;
  tags: string[];
  language: string;
};

export type VisualFeedMedia = {
  type: "image" | "video";
  role: string;
  previewUrl: string;
  posterUrl: string | null;
  sourceUrl: string | null;
  altText: string;
};

export type VisualFeedRecord = {
  id: string;
  title: string;
  prompt: string;
  mediaType: "image" | "video";
  recommendedModel: string;
  sourceModels: string[];
  categories: string[];
  tags: string[];
  language: string | null;
  source: {
    url: string;
    author: {
      handle: string;
      name: string | null;
    };
    attribution: string;
  };
  media: VisualFeedMedia[];
};

export type VisualFeedPayload = {
  schemaVersion?: string;
  count?: number;
  items?: VisualFeedRecord[];
};
