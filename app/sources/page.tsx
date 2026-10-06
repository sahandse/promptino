import Link from "next/link";
import { ExternalLink, Github, Globe2, Send, ShieldCheck } from "lucide-react";
import { sources } from "@/data/sources";

const kindMeta = {
  github: { label: "GitHub", icon: Github },
  website: { label: "سایت", icon: Globe2 },
  telegram: { label: "تلگرام", icon: Send },
};

const reuseMeta = {
  "safe-metadata": "استفاده امن از متادیتا",
  "check-license": "نیازمند بررسی مجوز",
  "attribution-only": "ارجاع و منبع‌دهی",
};

export default function SourcesPage() {
  return (
    <main>
      <header className="topbar container">
        <Link className="brand" href="/"><span className="brand-mark">P</span><span>Promptino</span></Link>
        <nav><Link href="/">خانه</Link><Link href="/sources">منابع</Link></nav>
      </header>

      <section className="hero container sources-hero">
        <div className="eyebrow"><ShieldCheck size={16} /> Source Registry</div>
        <h1>منابعی که Promptino<br /><span>از آن‌ها یاد می‌گیرد.</span></h1>
        <p>هر منبع با نوع محتوا، زبان، اندازه تقریبی و وضعیت بازاستفاده ثبت می‌شود. هدف ما ساخت آرشیوی شفاف و منبع‌دار است، نه کپی بدون اعتبار.</p>
      </section>

      <section className="source-list container">
        {sources.map((source) => {
          const meta = kindMeta[source.kind];
          const Icon = meta.icon;
          return (
            <article className="source-card" key={source.id}>
              <div className="source-card-top">
                <div className="source-kind"><Icon size={18} /><span>{meta.label}</span></div>
                <span className="source-size">{source.sizeLabel}</span>
              </div>
              <div><h2>{source.name}</h2><p>{source.note}</p></div>
              <div className="source-focus">{source.focus.map((item) => <span key={item}>{item}</span>)}</div>
              <div className="source-card-footer">
                <span className="reuse-state">{reuseMeta[source.reuse]}</span>
                <a href={source.url} target="_blank" rel="noreferrer">مشاهده منبع <ExternalLink size={15} /></a>
              </div>
            </article>
          );
        })}
      </section>

      <footer className="container"><span>Promptino Sources</span><span>{sources.length} منبع ثبت‌شده</span></footer>
    </main>
  );
}