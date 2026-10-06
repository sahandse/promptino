export type GalleryItem = {
  id: string;
  kind: "image" | "video";
  title: string;
  prompt: string;
  mediaUrl: string;
  sourceUrl: string;
  sourceName: string;
  model: string;
  tags: string[];
};

const imagePrompt = (n: number): GalleryItem => ({
  id: `visual-image-${n}`,
  kind: "image",
  title: `ایده تصویری #${n}`,
  prompt: `از این تصویر به‌عنوان مرجع بصری استفاده کن و یک نسخه تازه با موضوع [موضوع شما]، ترکیب‌بندی حرفه‌ای، نورپردازی دقیق، جزئیات طبیعی و بدون نوشته یا واترمارک بساز.`,
  mediaUrl: `https://raw.githubusercontent.com/benyshen/awesome-image-prompts/main/images/case${n}.jpg`,
  sourceUrl: `https://github.com/benyshen/awesome-image-prompts/blob/main/images/case${n}.jpg`,
  sourceName: "Awesome Image Prompts",
  model: "Image AI",
  tags: ["تصویر", "الهام", "AI"],
});

export const galleryItems: GalleryItem[] = [
  ...Array.from({ length: 36 }, (_, index) => imagePrompt(index + 1)),
  {
    id: "visual-video-656",
    kind: "video",
    title: "نمونه ویدیوی AI #656",
    prompt: "یک ویدیوی کوتاه سینمایی بر اساس موضوع [موضوع شما] بساز؛ حرکت دوربین نرم، نور واقعی، عمق میدان کنترل‌شده، جزئیات طبیعی و بدون متن روی تصویر.",
    mediaUrl: "https://raw.githubusercontent.com/benyshen/awesome-image-prompts/main/videos/case656.mp4",
    sourceUrl: "https://github.com/benyshen/awesome-image-prompts/blob/main/videos/case656.mp4",
    sourceName: "Awesome Image Prompts",
    model: "Video AI",
    tags: ["ویدیو", "سینمایی", "AI"],
  },
  {
    id: "visual-video-666",
    kind: "video",
    title: "نمونه ویدیوی AI #666",
    prompt: "یک کلیپ عمودی کوتاه با هوک بصری قوی، سه حرکت نرم، نورپردازی طبیعی و حس تبلیغاتی مدرن برای [موضوع شما] تولید کن.",
    mediaUrl: "https://raw.githubusercontent.com/benyshen/awesome-image-prompts/main/videos/case666.mp4",
    sourceUrl: "https://github.com/benyshen/awesome-image-prompts/blob/main/videos/case666.mp4",
    sourceName: "Awesome Image Prompts",
    model: "Video AI",
    tags: ["ویدیو", "عمودی", "تبلیغاتی"],
  },
  {
    id: "visual-video-720",
    kind: "video",
    title: "نمونه ویدیوی AI #720",
    prompt: "یک سکانس کوتاه سینمایی برای [موضوع شما] با شروع نزدیک، حرکت دوربین آرام، ریویل نهایی و نور حجمی طبیعی ایجاد کن.",
    mediaUrl: "https://raw.githubusercontent.com/benyshen/awesome-image-prompts/main/videos/case720.mp4",
    sourceUrl: "https://github.com/benyshen/awesome-image-prompts/blob/main/videos/case720.mp4",
    sourceName: "Awesome Image Prompts",
    model: "Video AI",
    tags: ["ویدیو", "ریویل", "حرکت دوربین"],
  },
  {
    id: "visual-video-725",
    kind: "video",
    title: "نمونه ویدیوی AI #725",
    prompt: "ویدیویی واقع‌گرایانه از [موضوع شما] با دوربین handheld کنترل‌شده، حرکت طبیعی سوژه و نور محیطی نرم بساز.",
    mediaUrl: "https://raw.githubusercontent.com/benyshen/awesome-image-prompts/main/videos/case725.mp4",
    sourceUrl: "https://github.com/benyshen/awesome-image-prompts/blob/main/videos/case725.mp4",
    sourceName: "Awesome Image Prompts",
    model: "Video AI",
    tags: ["ویدیو", "واقع‌گرایانه", "حرکت"],
  },
  {
    id: "visual-video-729",
    kind: "video",
    title: "نمونه ویدیوی AI #729",
    prompt: "برای [موضوع شما] یک کلیپ کوتاه با قاب‌بندی تمیز، رنگ‌بندی سینمایی، حرکت پیوسته و پایان نرم تولید کن.",
    mediaUrl: "https://raw.githubusercontent.com/benyshen/awesome-image-prompts/main/videos/case729.mp4",
    sourceUrl: "https://github.com/benyshen/awesome-image-prompts/blob/main/videos/case729.mp4",
    sourceName: "Awesome Image Prompts",
    model: "Video AI",
    tags: ["ویدیو", "رنگ", "سینمایی"],
  },
  {
    id: "visual-video-739",
    kind: "video",
    title: "نمونه ویدیوی AI #739",
    prompt: "یک شات تبلیغاتی کوتاه از [موضوع شما] با نور premium، دوربین نرم، جزئیات محصول و حس تجاری حرفه‌ای بساز.",
    mediaUrl: "https://raw.githubusercontent.com/benyshen/awesome-image-prompts/main/videos/case739.mp4",
    sourceUrl: "https://github.com/benyshen/awesome-image-prompts/blob/main/videos/case739.mp4",
    sourceName: "Awesome Image Prompts",
    model: "Video AI",
    tags: ["ویدیو", "محصول", "تبلیغات"],
  },
];
