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

export const prompts: Prompt[] = [
  {
    id: "brand-strategy",
    title: "استراتژی برند در یک صفحه",
    prompt: "برای یک برند در حوزه [حوزه فعالیت] یک استراتژی یک‌صفحه‌ای بساز. مخاطب هدف، جایگاه برند، ارزش پیشنهادی، لحن، سه پیام کلیدی و سه اقدام بعدی را شفاف و کوتاه ارائه کن.",
    type: "text",
    model: "ChatGPT",
    category: "کسب‌وکار",
    tags: ["برند", "استراتژی", "مارکتینگ"],
    source: "Promptino Editorial",
    sourceUrl: "https://platform.openai.com/docs/guides/prompt-engineering",
    language: "fa",
  },
  {
    id: "minimal-product-photo",
    title: "عکس محصول مینیمال استودیویی",
    prompt: "A premium studio product photo of [product], centered composition, soft diffused lighting, subtle realistic shadow, clean seamless background, editorial commercial photography, natural material texture, high detail, no text, no watermark.",
    type: "image",
    model: "Image models",
    category: "عکاسی محصول",
    tags: ["محصول", "استودیو", "مینیمال"],
    source: "Promptino Editorial",
    sourceUrl: "https://platform.openai.com/docs/guides/images",
    language: "en",
  },
  {
    id: "cinematic-video",
    title: "ویدیوی معرفی سینمایی",
    prompt: "Create a cinematic 8-second reveal of [subject]. Begin with a close detail shot, slowly pull back to reveal the full scene, soft volumetric light, realistic motion, subtle depth of field, natural camera movement, premium commercial mood, no captions.",
    type: "video",
    model: "Veo / Kling",
    category: "ویدیوی تبلیغاتی",
    tags: ["سینمایی", "تبلیغاتی", "ریویل"],
    source: "Promptino Editorial",
    sourceUrl: "https://deepmind.google/models/veo/",
    language: "en",
  },
  {
    id: "ui-review",
    title: "بازبینی حرفه‌ای UI/UX",
    prompt: "نقش یک طراح ارشد محصول را داشته باش. رابط [نام محصول/صفحه] را از نظر سلسله‌مراتب بصری، خوانایی، دسترس‌پذیری، فاصله‌گذاری، وضوح CTA و تجربه موبایل بررسی کن. ایرادها را بر اساس شدت اولویت‌بندی کن و برای هر مورد راه‌حل عملی بده.",
    type: "text",
    model: "Claude / ChatGPT",
    category: "طراحی محصول",
    tags: ["UI", "UX", "طراحی"],
    source: "Promptino Editorial",
    sourceUrl: "https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview",
    language: "fa",
  },
  {
    id: "app-icon",
    title: "آیکون اپ مینیمال",
    prompt: "Design a minimal app icon for [app concept], single bold symbolic shape, strong silhouette, no lettering, no mockup, balanced negative space, modern flat-to-subtle-3D finish, centered on a clean square canvas.",
    type: "image",
    model: "Flux / Midjourney",
    category: "برندینگ",
    tags: ["لوگو", "آیکون", "اپلیکیشن"],
    source: "Promptino Editorial",
    sourceUrl: "https://docs.midjourney.com/",
    language: "en",
  },
  {
    id: "vertical-social-video",
    title: "ویدیوی عمودی شبکه اجتماعی",
    prompt: "Generate a vertical 9:16 social video featuring [subject]. Strong visual hook in the first second, three seamless visual beats, dynamic but stable camera, realistic lighting, clean composition, polished creator-ad aesthetic, 8 seconds, no on-screen text.",
    type: "video",
    model: "Veo / Runway",
    category: "شبکه اجتماعی",
    tags: ["Reels", "9:16", "ویدیو"],
    source: "Promptino Editorial",
    sourceUrl: "https://help.runwayml.com/",
    language: "en",
  },
];
