"use client";

import { useMemo, useState } from "react";
import {
  Copy,
  Check,
  Search,
  Sparkles,
  ImageIcon,
  Video,
  MessageSquareText,
  Bookmark,
  ExternalLink,
  SlidersHorizontal,
} from "lucide-react";
import { prompts, type PromptType } from "@/data/prompts";

const filters: { label: string; value: "all" | PromptType; icon: React.ReactNode }[] = [
  { label: "همه", value: "all", icon: <Sparkles size={18} /> },
  { label: "متن", value: "text", icon: <MessageSquareText size={18} /> },
  { label: "تصویر", value: "image", icon: <ImageIcon size={18} /> },
  { label: "ویدیو", value: "video", icon: <Video size={18} /> },
];

export default function Home() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<"all" | PromptType>("all");
  const [copied, setCopied] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return prompts.filter((item) => {
      const matchesType = type === "all" || item.type === type;
      const haystack = [item.title, item.prompt, item.model, item.category, ...item.tags]
        .join(" ")
        .toLowerCase();
      return matchesType && (!q || haystack.includes(q));
    });
  }, [query, type]);

  async function copyPrompt(id: string, value: string) {
    await navigator.clipboard.writeText(value);
    setCopied(id);
    window.setTimeout(() => setCopied(null), 1600);
  }

  return (
    <main>
      <header className="topbar container">
        <a className="brand" href="#">
          <span className="brand-mark">P</span>
          <span>Promptino</span>
        </a>
        <nav>
          <a href="#prompts">پرامپت‌ها</a>
          <a href="#sources">منابع</a>
          <button className="ghost-btn" aria-label="ذخیره‌ها">
            <Bookmark size={19} />
            ذخیره‌ها
          </button>
        </nav>
      </header>

      <section className="hero container">
        <div className="eyebrow"><Sparkles size={16} /> کتابخانه فارسی پرامپت</div>
        <h1>پرامپت خوب را پیدا کن،<br /><span>کپی کن و بساز.</span></h1>
        <p>
          مجموعه‌ای مرتب و منبع‌دار برای ChatGPT، Gemini، Claude، Midjourney،
          Flux، Veo، Kling و ابزارهای دیگر.
        </p>

        <div className="searchbox">
          <Search size={21} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="مثلاً: لوگو مینیمال، ویدیوی سینمایی، برنامه‌نویسی..."
            aria-label="جستجوی پرامپت"
          />
          <span className="search-kbd">⌘ K</span>
        </div>

        <div className="filter-row" id="prompts">
          {filters.map((filter) => (
            <button
              key={filter.value}
              className={type === filter.value ? "filter active" : "filter"}
              onClick={() => setType(filter.value)}
            >
              {filter.icon}
              {filter.label}
            </button>
          ))}
          <span className="result-count"><SlidersHorizontal size={16} /> {filtered.length} پرامپت</span>
        </div>
      </section>

      <section className="grid container">
        {filtered.map((item) => (
          <article className="prompt-card" key={item.id}>
            <div className="card-top">
              <div>
                <span className={`type-pill ${item.type}`}>
                  {item.type === "image" ? "تصویر" : item.type === "video" ? "ویدیو" : "متن"}
                </span>
                <span className="model-pill">{item.model}</span>
              </div>
              <button className="icon-btn" aria-label="ذخیره">
                <Bookmark size={18} />
              </button>
            </div>

            <div>
              <p className="category">{item.category}</p>
              <h2>{item.title}</h2>
              <p className="prompt-preview">{item.prompt}</p>
            </div>

            <div className="tags">
              {item.tags.slice(0, 3).map((tag) => <span key={tag}>#{tag}</span>)}
            </div>

            <div className="card-actions">
              <button className="copy-btn" onClick={() => copyPrompt(item.id, item.prompt)}>
                {copied === item.id ? <Check size={18} /> : <Copy size={18} />}
                {copied === item.id ? "کپی شد" : "کپی پرامپت"}
              </button>
              <a href={item.sourceUrl} target="_blank" rel="noreferrer" className="source-btn">
                منبع <ExternalLink size={16} />
              </a>
            </div>
          </article>
        ))}
      </section>

      <section className="sources container" id="sources">
        <div>
          <p className="section-kicker">شفافیت منابع</p>
          <h2>هر پرامپت، منبع خودش را دارد.</h2>
          <p>Promptino منبع، مدل پیشنهادی و دسته‌بندی هر مورد را نگه می‌دارد تا آرشیو قابل اعتماد و قابل توسعه باشد.</p>
        </div>
        <div className="source-stats">
          <div><strong>۳</strong><span>نوع محتوا</span></div>
          <div><strong>FA / EN</strong><span>دو زبانه</span></div>
          <div><strong>۱ کلیک</strong><span>کپی سریع</span></div>
        </div>
      </section>

      <footer className="container">
        <span>Promptino</span>
        <span>ساخته‌شده برای پیدا کردن ایده بهتر، سریع‌تر ✦</span>
      </footer>
    </main>
  );
}
