import Link from "next/link";
import { ArrowRight, Clapperboard } from "lucide-react";
import ReelsFeed from "@/components/ReelsFeed";

export default function ReelsPage() {
  return (
    <main className="reels-page">
      <header className="reels-topbar">
        <Link href="/" className="reels-back"><ArrowRight size={19} /> خانه</Link>
        <div className="reels-title"><Clapperboard size={18} /> Reels</div>
        <span />
      </header>
      <ReelsFeed />
    </main>
  );
}
