export type PromptType = "text" | "image" | "video";

export type Prompt = {
  id: string;
  title: string;
  prompt: string;
  type: PromptType;
  model: string;
  category: string;
  tags: string[];
  source: string;
  sourceUrl: string;
  language: "fa" | "en";
};

// No demo/editorial prompts. This collection stays empty until populated from a verified real source.
export const prompts: Prompt[] = [];
