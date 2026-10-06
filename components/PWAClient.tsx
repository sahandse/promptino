"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export default function PWAClient() {
  const [deferred, setDeferred] = useState<InstallPromptEvent | null>(null);
  const [standalone, setStandalone] = useState(false);

  useEffect(() => {
    const base = window.location.pathname.startsWith("/promptino") ? "/promptino" : "";

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register(`${base}/sw.js`).catch(() => undefined);
    }

    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
    setStandalone(isStandalone);

    const handler = (event: Event) => {
      event.preventDefault();
      setDeferred(event as InstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
  }

  if (standalone || !deferred) return null;

  return (
    <button className="pwa-install" onClick={install}>
      <Download size={16} />
      نصب Promptino
    </button>
  );
}
