"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Flag, ExternalLink, Trash2 } from "lucide-react";
import { REPORTS_KEY, readJson, writeJson, type ReportItem } from "@/lib/visualSource";

export default function ReportsPage(){
  const [items,setItems]=useState<ReportItem[]>([]);

  useEffect(()=>setItems(readJson<ReportItem[]>(REPORTS_KEY,[])),[]);

  function clearAll(){setItems([]);writeJson(REPORTS_KEY,[]);}

  return <main>
    <header className="topbar container">
      <Link className="brand" href="/"><span className="brand-mark">P</span><span>Promptino</span></Link>
      <nav><Link href="/">خانه</Link></nav>
    </header>
    <section className="hero container compact-hero">
      <div className="eyebrow"><Flag size={16}/> Report Center</div>
      <h1>گزارش‌های <span>ثبت‌شده.</span></h1>
      <p>مواردی که خودت برای بررسی Mapping یا منبع علامت زده‌ای.</p>
    </section>
    <section className="container history-list">
      {items.length>0&&<button className="clear-history" onClick={clearAll}><Trash2 size={15}/> پاک‌کردن گزارش‌ها</button>}
      {items.length===0?<div className="feed-empty">گزارشی ثبت نشده.</div>:items.map(item=><article className="history-card" key={item.id}>
        <div><strong>{item.title}</strong><span>{new Date(item.reportedAt).toLocaleString("fa-IR")}</span></div>
        <p>{item.id}</p>
        <a className="source-btn" href={item.sourceUrl} target="_blank" rel="noreferrer">منبع اصلی <ExternalLink size={14}/></a>
      </article>)}
    </section>
  </main>
}