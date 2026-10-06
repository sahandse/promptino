"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BarChart3, Copy, FolderHeart, Heart } from "lucide-react";
import { HISTORY_KEY, readFavorites, readJson } from "@/lib/visualSource";

type Collection={id:string;name:string;itemIds:string[]};
const COLLECTIONS_KEY="promptino:collections-v1";

export default function StatsPage(){
  const [favoriteCount,setFavoriteCount]=useState(0);
  const [history,setHistory]=useState<{id:string}[]>([]);
  const [collections,setCollections]=useState<Collection[]>([]);

  useEffect(()=>{
    setFavoriteCount(readFavorites().length);
    setHistory(readJson(HISTORY_KEY,[]));
    setCollections(readJson(COLLECTIONS_KEY,[]));
  },[]);

  const uniqueCopied=useMemo(()=>new Set(history.map(i=>i.id)).size,[history]);

  return <main>
    <header className="topbar container">
      <Link className="brand" href="/"><span className="brand-mark">P</span><span>Promptino</span></Link>
      <nav><Link href="/">خانه</Link></nav>
    </header>
    <section className="hero container compact-hero">
      <div className="eyebrow"><BarChart3 size={16}/> My Stats</div>
      <h1>آمار استفاده <span>روی همین دستگاه.</span></h1>
      <p>بدون اکانت و بدون ارسال اطلاعات شخصی.</p>
    </section>
    <section className="container stats-grid">
      <div className="metric-card"><Heart/><strong>{favoriteCount.toLocaleString("fa-IR")}</strong><span>علاقه‌مندی</span></div>
      <div className="metric-card"><Copy/><strong>{uniqueCopied.toLocaleString("fa-IR")}</strong><span>پرامپت کپی‌شده</span></div>
      <div className="metric-card"><FolderHeart/><strong>{collections.length.toLocaleString("fa-IR")}</strong><span>مجموعه</span></div>
      <div className="metric-card"><BarChart3/><strong>{history.length.toLocaleString("fa-IR")}</strong><span>فعالیت ثبت‌شده</span></div>
    </section>
  </main>;
}