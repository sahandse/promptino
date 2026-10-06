"use client";

import { useEffect, useState } from "react";
import { Bookmark } from "lucide-react";

const KEY = "promptino:favorites";

function readFavorites(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const value = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

export default function FavoriteButton({ id, compact = false }: { id: string; compact?: boolean }) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(readFavorites().includes(id));
  }, [id]);

  function toggle() {
    const current = readFavorites();
    const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
    localStorage.setItem(KEY, JSON.stringify(next));
    setSaved(next.includes(id));
  }

  return (
    <button
      type="button"
      className={compact ? (saved ? "icon-btn saved" : "icon-btn") : (saved ? "favorite-wide saved" : "favorite-wide")}
      onClick={toggle}
      aria-label={saved ? "حذف از ذخیره‌ها" : "ذخیره پرامپت"}
      title={saved ? "ذخیره شده" : "ذخیره"}
    >
      <Bookmark size={18} fill={saved ? "currentColor" : "none"} />
      {!compact && (saved ? "ذخیره شده" : "ذخیره")}
    </button>
  );
}
