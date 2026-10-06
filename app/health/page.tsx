"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Activity, BadgeCheck, Database, ImageIcon, Video } from "lucide-react";
import type { GalleryItem } from "@/data/gallery";
import { getActiveAdapters } from "@/lib/sourceAdapters";

export default function HealthPage(){
  const [items,setItems]=useState<GalleryItem[]>([]);
  const [error,setError]=useState(false);
  const [loading,setLoading]=useState(true);

  useEffect(()=>{
    Promise.all(getActiveAdapters().map(a=>a.fetchItems()))
      .then(b=>setItems(b.flat()))
      .catch(()=>setError(true))
      .finally(()=>setLoading(false));
  },[]);

  const metrics=useMemo(()=>{
    const images=items.filter(i=>i.kind==="image").length;
    const videos=items.filter(i=>i.kind==="video").length;
    const avg=items.length?Math.round(items.reduce((s,i)=>s+i.qualityScore,0)/items.length):0;
    return {images,videos,avg,total:items.length};
  },[items]);

  return <main>
    <header className="topbar container">
      <Link className="brand" href="/"><span className="brand-mark">P</span><span>Promptino</span></Link>
      <nav><Link href="/sources">منابع</Link><Link href="/">خانه</Link></nav>
    </header>

    <section className="hero container compact-hero">
      <div className="eyebrow"><Activity size={16}/> Source Health</div>
      <h1>سلامت <span>دیتای واقعی.</span></h1>
      <p>این صفحه از Adapterهای فعال محاسبه می‌شود و دیتای دمو ندارد.</p>
    </section>

    <section className="container health-grid">
      <div className="metric-card"><Database/><strong>{loading?"…":metrics.total.toLocaleString("fa-IR")}</strong><span>رکورد معتبر</span></div>
      <div className="metric-card"><ImageIcon/><strong>{metrics.images.toLocaleString("fa-IR")}</strong><span>تصویر</span></div>
      <div className="metric-card"><Video/><strong>{metrics.videos.toLocaleString("fa-IR")}</strong><span>ویدیو</span></div>
      <div className="metric-card"><BadgeCheck/><strong>{metrics.avg.toLocaleString("fa-IR")}%</strong><span>میانگین Quality</span></div>
    </section>

    <section className="container health-list">
      {getActiveAdapters().map(adapter=><div className="health-row" key={adapter.id}>
        <strong>{adapter.name}</strong>
        <span className={error?"health-warn":"health-ok"}>{error?"اختلال":"فعال"}</span>
        <small>{adapter.endpoint}</small>
      </div>)}
    </section>
  </main>;
}