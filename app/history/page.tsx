"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { History, Copy, Trash2 } from "lucide-react";
import { HISTORY_KEY, readJson, writeJson, type CopyHistoryItem } from "@/lib/visualSource";

export default function HistoryPage() {
  const [items, setItems] = useState<CopyHistoryItem[]>([]);

  useEffect(() => setItems(readJson<CopyHistoryItem[]>(HISTORY_KEY, [])), []);

  function clearAll() { setItems([]); writeJson(HISTORY_KEY, []); }

  return (
    <main>
      <header className="topbar container">
        <Link className="brand" href="/"><span className="brand-mark">P</span><span>Promptino</span></Link>
        <nav><Link href="/">خانه</Link></nav>
      </header>

      <section className="hero container compact-hero">
        <div className="eyebrow"><History size={16}/> History</div>
        <h1>آخرین پرامپت‌های <span>کپی‌شده.</span></h1>
      </section>

      <section className="container history-list">
        {items.length > 0 && <button className="clear-history" onClick={clearAll}><Trash2 size={15}/> پاک‌کردن تاریخچه</button>}
        {items.length === 0 ? <div className="feed-empty">تاریخچه خالی است.</div> : items.map((item) => (
          <article className="history-card" key={item.id}>
            <div><strong>{item.title}</strong><span>{new Date(item.copiedAt).toLocaleString("fa-IR")}</span></div>
            <p dir="auto">{item.prompt}</p>
            <button onClick={() => navigator.clipboard.writeText(item.prompt)}><Copy size={15}/> کپی دوباره</button>
          </article>
        ))}
      </section>
    </main>
  );
}
