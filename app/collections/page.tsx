"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { FolderHeart, Plus, Trash2 } from "lucide-react";
import type { GalleryItem } from "@/data/gallery";
import { readFavorites, readJson, writeJson } from "@/lib/visualSource";

type Collection = { id: string; name: string; itemIds: string[] };
const KEY = "promptino:collections-v1";

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [name, setName] = useState("");
  const [favorites, setFavorites] = useState<GalleryItem[]>([]);

  useEffect(() => {
    setCollections(readJson<Collection[]>(KEY, []));
    setFavorites(readFavorites());
  }, []);

  function createCollection() {
    const value = name.trim();
    if (!value) return;
    const next = [...collections, { id: crypto.randomUUID(), name: value, itemIds: [] }];
    setCollections(next); writeJson(KEY, next); setName("");
  }

  function toggleItem(collectionId: string, itemId: string) {
    const next = collections.map((collection) => {
      if (collection.id !== collectionId) return collection;
      const exists = collection.itemIds.includes(itemId);
      return { ...collection, itemIds: exists ? collection.itemIds.filter((id) => id !== itemId) : [...collection.itemIds, itemId] };
    });
    setCollections(next); writeJson(KEY, next);
  }

  function removeCollection(id: string) {
    const next = collections.filter((collection) => collection.id !== id);
    setCollections(next); writeJson(KEY, next);
  }

  const favoriteMap = useMemo(() => new Map(favorites.map((item) => [item.id, item])), [favorites]);

  return (
    <main>
      <header className="topbar container">
        <Link className="brand" href="/"><span className="brand-mark">P</span><span>Promptino</span></Link>
        <nav><Link href="/">خانه</Link></nav>
      </header>

      <section className="hero container compact-hero">
        <div className="eyebrow"><FolderHeart size={16}/> Collections</div>
        <h1>مجموعه‌های <span>شخصی.</span></h1>
        <p>بدون ثبت‌نام و فقط روی همین دستگاه ذخیره می‌شوند.</p>
      </section>

      <section className="container collection-create">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="مثلاً: پرامپت محصول"/>
        <button onClick={createCollection}><Plus size={17}/> ساخت مجموعه</button>
      </section>

      <section className="container collection-list">
        {collections.length === 0 ? (
          <div className="feed-empty">هنوز مجموعه‌ای نساختی.</div>
        ) : collections.map((collection) => (
          <article className="collection-card" key={collection.id}>
            <div className="collection-head">
              <div><strong>{collection.name}</strong><span>{collection.itemIds.length.toLocaleString("fa-IR")} مورد</span></div>
              <button onClick={() => removeCollection(collection.id)}><Trash2 size={16}/></button>
            </div>
            <div className="collection-picks">
              {favorites.map((item) => (
                <button key={item.id} className={collection.itemIds.includes(item.id) ? "pick active" : "pick"} onClick={() => toggleItem(collection.id, item.id)}>
                  <img src={item.kind === "image" ? item.mediaUrl : (item.posterUrl || "")} alt="" />
                  <span>{item.title}</span>
                </button>
              ))}
            </div>
            {collection.itemIds.length > 0 && (
              <div className="collection-preview">
                {collection.itemIds.slice(0,6).map((id) => {
                  const item = favoriteMap.get(id);
                  return item ? <Link key={id} href={`/?item=${encodeURIComponent(id)}`}><img src={item.kind === "image" ? item.mediaUrl : (item.posterUrl || "")} alt={item.title}/></Link> : null;
                })}
              </div>
            )}
          </article>
        ))}
      </section>
    </main>
  );
}
