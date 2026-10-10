"use client";

import { useEffect, useState } from "react";
import { Download, Share, X } from "lucide-react";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export default function PWAClient() {
  const [deferred, setDeferred] = useState<InstallPromptEvent | null>(null);
  const [standalone, setStandalone] = useState(false);
  const [ios, setIos] = useState(false);
  const [iosHelpOpen, setIosHelpOpen] = useState(false);

  useEffect(() => {
    const base = window.location.pathname.startsWith("/promptino") ? "/promptino" : "";

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register(`${base}/sw.js`).catch(() => undefined);
    }

    const nav = navigator as Navigator & { standalone?: boolean };
    const ua = navigator.userAgent;
    const isIOS =
      /iPad|iPhone|iPod/.test(ua) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      Boolean(nav.standalone);

    setIos(isIOS);
    setStandalone(isStandalone);

    const handler = (event: Event) => {
      event.preventDefault();
      setDeferred(event as InstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function install() {
    if (ios) {
      setIosHelpOpen(true);
      return;
    }
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
  }

  if (standalone || (!deferred && !ios)) return null;

  return (
    <>
      <button className="pwa-install" onClick={install}>
        <Download size={16} />
        نصب Promptino
      </button>

      {iosHelpOpen && (
        <div className="ios-install-backdrop" onClick={() => setIosHelpOpen(false)}>
          <div className="ios-install-sheet" role="dialog" aria-modal="true" aria-label="نصب Promptino روی آیفون" onClick={(event) => event.stopPropagation()}>
            <div className="sheet-handle" />
            <div className="ios-install-head">
              <strong>نصب روی iPhone</strong>
              <button onClick={() => setIosHelpOpen(false)} aria-label="بستن"><X size={19} /></button>
            </div>

            <div className="ios-install-steps">
              <div><span>۱</span><p>در Safari روی دکمه اشتراک بزن.</p><Share size={18} /></div>
              <div><span>۲</span><p>گزینه «Add to Home Screen» را انتخاب کن.</p></div>
              <div><span>۳</span><p>بالا سمت راست روی «Add» بزن.</p></div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
