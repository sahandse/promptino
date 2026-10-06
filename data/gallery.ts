export type GalleryItem = {
  id: string;
  kind: "image" | "video";
  title: string;
  prompt: string;
  mediaUrl: string;
  sourceUrl: string;
  sourceName: string;
  category: string;
  tags: string[];
  language: "fa" | "en" | "other";
};

export type SourcePromptRecord = {
  id: number | string;
  title?: string | null;
  prompt?: string | null;
  image?: string | null;
  video?: string | null;
  media_type?: "image" | "video" | string | null;
  source?: string | null;
  orig_category?: string | null;
  category?: string | null;
  created_at?: string | null;
};

export type SourcePromptPayload = {
  count?: number;
  built_at?: string;
  items?: SourcePromptRecord[];
};
