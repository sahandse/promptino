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
  categories: string[];
  tags: string[];
  language: string;
  publishedAt: string | null;
  likes: number;
  sourceLicense: string;
  rightsHolder: string;
  providerId: string;
  providerName: string;
  translatedPrompt?: string | null;
  qualityScore: number;
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
    publishedAt: string | null;
    engagement?: {
      likes?: number | null;
      reposts?: number | null;
      replies?: number | null;
    };
    attribution: string;
    license: string;
    rightsHolder: string;
  };
  media: VisualFeedMedia[];
};

export type VisualFeedPayload = {
  schemaVersion?: string;
  count?: number;
  items?: VisualFeedRecord[];
};
