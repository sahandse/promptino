import Link from "next/link";
import { ExternalLink, Github, Globe2, Send, ShieldCheck, BadgeCheck, Clock3 } from "lucide-react";
import { sources } from "@/data/sources";

const kindMeta = {
  github: { label: "GitHub", icon: Github },
  website: { label: "سایت", icon: Globe2 },
  telegram: { label: "تلگرام", icon: Send },
};

const reuseMeta = {
  "safe-metadata": "فقط متادیتا",
  "check-license": "نیازمند بررسی مجوز",
  "attribution-only": "ارجاع و منبع‌دهی",
};

export default function SourcesPage() {
  const active = sources.filter((source) => source.status === "active").length;
  return (
    <main>
      <header className="topbar container">
        <Link className="brand" href="/"><span className="brand-mark">P</span><span>Promptino</span></Link>
        <nav><Link href="/">خانه</Link><Link href="/sources">منابع</Link></nav>
      </header>

      <section className="hero container sources-hero">
        <div className="eyebrow"><ShieldCheck size={16} /> Source Registry</div>
        <h1>فقط منبعی وارد فید می‌شود<br /><span>که قابل اعتبارسنجی باشد.</span></h1>
        <p>
          منبع فعال باید prompt، رسانه، نویسنده و URL اصلی را با mapping قابل بررسی ارائه کند.
          منابع دیگر تا زمان ساخت Adapter و تأیید مستقل فقط در Registry می‌مانند.
        </p>
      </section>

      <section className="source-list container">
        {sources.map((source) => {
          const meta = kindMeta[source.kind];
          const Icon = meta.icon;
          return (
            <article className="source-card" key={source.id}>
              <div className="source-card-top">
                <div className="source-kind"><Icon size={18} /><span>{meta.label}</span></div>
                <span className={source.status === "active" ? "source-status active" : "source-status review"}>
                  {source.status === "active" ? <BadgeCheck size={13} /> : <Clock3 size={13} />}
                  {source.status === "active" ? "فعال و تأییدشده" : "در انتظار بررسی"}
                </span>
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

      <footer className="container">
        <span>Promptino Sources</span>
        <span>{active.toLocaleString("fa-IR")} منبع فعال · {sources.length.toLocaleString("fa-IR")} منبع ثبت‌شده</span>
      </footer>
    </main>
  );
}
