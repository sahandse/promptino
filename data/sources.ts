export type SourceKind = "github" | "website" | "telegram";

export type PromptSource = {
  id: string;
  name: string;
  kind: SourceKind;
  url: string;
  focus: string[];
  language: "fa" | "en" | "multi";
  sizeLabel: string;
  reuse: "safe-metadata" | "check-license" | "attribution-only";
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
    note: "دیتاست ساختاریافته با نویسنده و لینک منبع؛ متن پرامپت و مدیای اصلی الزاماً دارای مجوز باز نیست.",
  },
  {
    id: "prompts-for-everything",
    name: "Prompts for Everything",
    kind: "github",
    url: "https://github.com/mlnjsh/prompts-for-everything",
    focus: ["llm", "image", "video", "coding", "business"],
    language: "en",
    sizeLabel: "180+",
    reuse: "check-license",
    note: "مجموعه دسته‌بندی‌شده برای متن، تصویر، ویدیو و کدنویسی؛ مجوز هر بخش قبل از ورود متن بررسی می‌شود.",
  },
  {
    id: "awesome-image-prompts",
    name: "Awesome Image Prompts",
    kind: "github",
    url: "https://github.com/benyshen/awesome-image-prompts",
    focus: ["image", "video", "prompt-as-code"],
    language: "multi",
    sizeLabel: "700+",
    reuse: "check-license",
    note: "نمونه‌های تصویری و ویدیویی همراه منبع و JSON ساختاریافته.",
  },
  {
    id: "ultimate-generator",
    name: "Ultimate Image & Video Prompt Generator",
    kind: "github",
    url: "https://github.com/DareDev256/Ultimate-Image-Video-Prompt-Generator",
    focus: ["image", "video", "generator", "camera"],
    language: "en",
    sizeLabel: "1400+",
    reuse: "check-license",
    note: "مجموعه بزرگ به‌همراه موتور ساخت پرامپت و دسته‌بندی‌های راهنما.",
  },
  {
    id: "fulhar",
    name: "Fulhar Prompt Library",
    kind: "website",
    url: "https://www.fulhar.com/prompts",
    focus: ["image", "video"],
    language: "en",
    sizeLabel: "25K+",
    reuse: "safe-metadata",
    note: "برای کشف موضوع، مدل و دسته‌بندی؛ متن‌ها فقط طبق شرایط خود منبع استفاده می‌شوند.",
  },
  {
    id: "promptsref",
    name: "Promptsref",
    kind: "website",
    url: "https://promptsref.com/",
    focus: ["image", "video", "photography", "ads"],
    language: "en",
    sizeLabel: "10K+",
    reuse: "safe-metadata",
    note: "کتابخانه عمومی بزرگ برای کشف ترند و دسته‌بندی.",
  },
  {
    id: "pixeldojo",
    name: "PixelDojo Prompt Library",
    kind: "website",
    url: "https://pixeldojo.ai/prompts",
    focus: ["image", "video", "model-specific"],
    language: "en",
    sizeLabel: "600+",
    reuse: "safe-metadata",
    note: "نمونه‌های واقعی بر اساس مدل و کاربرد؛ مناسب برای Registry و لینک منبع.",
  },
  {
    id: "mujo",
    name: "Mujo AI Prompt Library",
    kind: "website",
    url: "https://mujoai.com/promtslibrary",
    focus: ["product", "ugc", "fashion", "ads", "video"],
    language: "en",
    sizeLabel: "Packs",
    reuse: "safe-metadata",
    note: "پک‌های دسته‌بندی‌شده بر اساس مدل و کاربرد، همراه نمونه خروجی.",
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
    note: "منبع فارسی برای کشف ترندها؛ بدون کپی انبوه متن یا رسانه.",
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
    note: "برای کشف نمونه‌های تصویری و ویدیویی و ارجاع به منبع.",
  },
];