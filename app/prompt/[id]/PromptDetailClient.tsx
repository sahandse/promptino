"use client";

import Link from "next/link";
import { Check, Copy, ExternalLink, ArrowRight } from "lucide-react";
import { useState } from "react";
import type { Prompt } from "@/data/prompts";
import FavoriteButton from "@/components/FavoriteButton";

export default function PromptDetailClient({ item }: { item: Prompt }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(item.prompt);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <main>
      <header className="topbar container">
        <Link className="brand" href="/">
          <span className="brand-mark">P</span><span>Promptino</span>
        </Link>
        <nav><Link href="/">خانه</Link><Link href="/sources">منابع</Link></nav>
      </header>

      <section className="detail-wrap container">
        <Link className="back-link" href="/"><ArrowRight size={16} /> بازگشت</Link>

        <div className="detail-layout">
          <article className="detail-main">
            <div className="detail-meta">
              <span className={`type-pill ${item.type}`}>
                {item.type === "image" ? "تصویر" : item.type === "video" ? "ویدیو" : "متن"}
              </span>
              <span className="model-pill">{item.model}</span>
              <span className="model-pill">{item.category}</span>
            </div>

            <h1>{item.title}</h1>

            <div className="prompt-full">
              <p>{item.prompt}</p>
              <button className="copy-large" onClick={copy}>
                {copied ? <Check size={19} /> : <Copy size={19} />}
                {copied ? "کپی شد" : "کپی پرامپت"}
              </button>
            </div>

            <div className="detail-tags">
              {item.tags.map((tag) => <span key={tag}>#{tag}</span>)}
            </div>
          </article>

          <aside className="detail-aside">
            <FavoriteButton id={item.id} />
            <div className="info-card"><span>مدل پیشنهادی</span><strong>{item.model}</strong></div>
            <div className="info-card"><span>زبان</span><strong>{item.language === "fa" ? "فارسی" : "انگلیسی"}</strong></div>
            <div className="info-card">
              <span>منبع</span><strong>{item.source}</strong>
              <a href={item.sourceUrl} target="_blank" rel="noreferrer">مشاهده منبع <ExternalLink size={14} /></a>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}