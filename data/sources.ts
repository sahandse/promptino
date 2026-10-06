export type SourceKind = "github" | "website" | "telegram";
export type SourceStatus = "active" | "review";

export type PromptSource = {
  id: string;
  name: string;
  kind: SourceKind;
  url: string;
  focus: string[];
  language: "fa" | "en" | "multi";
  sizeLabel: string;
  reuse: "safe-metadata" | "check-license" | "attribution-only";
  status: SourceStatus;
  adapter: string | null;
  note: string;
};

export const sources: PromptSource[] = [
  {
    id: "visual-prompt-feed",
    name: "Visual Prompt Feed",
    kind: "github",
    url: "https://github.com/Hanyuyu/visual-prompt-feed",
    focus: ["image", "video", "cinematic", "product", "ugc"],
    language: "en",
    sizeLabel: "2500+",
    reuse: "attribution-only",
    status: "active",
    adapter: "visualPromptFeedAdapter",
    note: "منبع فعال. هر رکورد دارای prompt، media، نویسنده، source URL و schema قابل اعتبارسنجی است.",
  },
  {
    id: "awesome-image-prompts",
    name: "Awesome Image Prompts",
    kind: "github",
    url: "https://github.com/benyshen/awesome-image-prompts",
    focus: ["image", "video", "prompt-as-code"],
    language: "multi",
    sizeLabel: "875",
    reuse: "attribution-only",
    status: "review",
    adapter: null,
    note: "در انتظار Adapter و اعتبارسنجی مستقل؛ تا قبل از تأیید وارد فید نمی‌شود.",
  },
  {
    id: "prompts-for-everything",
    name: "Prompts for Everything",
    kind: "github",
    url: "https://github.com/mlnjsh/prompts-for-everything",
    focus: ["llm", "image", "video", "coding", "business"],
    language: "en",
    sizeLabel: "مجموعه",
    reuse: "check-license",
    status: "review",
    adapter: null,
    note: "کاندید برای بخش متنی؛ قبل از ورود نیازمند بررسی schema و مجوز هر بخش است.",
  },
  {
    id: "hoosha-ai",
    name: "Hoosha AI",
    kind: "telegram",
    url: "https://t.me/Hoosha_ai",
    focus: ["fa", "image", "video", "trends"],
    language: "fa",
    sizeLabel: "کانال عمومی",
    reuse: "attribution-only",
    status: "review",
    adapter: null,
    note: "فقط برای کشف منبع فارسی. بدون کپی انبوه و تا زمان وجود mapping معتبر وارد فید نمی‌شود.",
  },
  {
    id: "prompt-examples",
    name: "AI Prompts & Image Examples",
    kind: "telegram",
    url: "https://t.me/Prompt_Examples",
    focus: ["image", "video", "examples"],
    language: "en",
    sizeLabel: "کانال عمومی",
    reuse: "attribution-only",
    status: "review",
    adapter: null,
    note: "کاندید بررسی. فقط آیتم‌هایی با رسانه و پرامپت دقیق و منبع قابل اثبات قابل ورود هستند.",
  },
  {
    id: "fulhar",
    name: "Fulhar Prompt Library",
    kind: "website",
    url: "https://www.fulhar.com/prompts",
    focus: ["image", "video"],
    language: "en",
    sizeLabel: "کتابخانه",
    reuse: "safe-metadata",
    status: "review",
    adapter: null,
    note: "فعلاً فقط منبع کشف؛ متن یا رسانه بدون مجوز و mapping روشن وارد فید نمی‌شود.",
  },
  {
    id: "promptsref",
    name: "Promptsref",
    kind: "website",
    url: "https://promptsref.com/",
    focus: ["image", "video", "photography", "ads"],
    language: "en",
    sizeLabel: "کتابخانه",
    reuse: "safe-metadata",
    status: "review",
    adapter: null,
    note: "فعلاً فقط Registry؛ نیازمند Adapter و بررسی شرایط بازاستفاده.",
  },
  {
    id: "pixeldojo",
    name: "PixelDojo Prompt Library",
    kind: "website",
    url: "https://pixeldojo.ai/prompts",
    focus: ["image", "video", "model-specific"],
    language: "en",
    sizeLabel: "کتابخانه",
    reuse: "safe-metadata",
    status: "review",
    adapter: null,
    note: "کاندید بررسی؛ تا زمان اعتبارسنجی مستقل وارد فید نمی‌شود.",
  },
];
