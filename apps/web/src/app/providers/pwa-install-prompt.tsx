"use client";

import { useEffect, useState } from "react";
import type { JSX } from "react";
import { Button } from "@event-organizer/ui";

type BeforeInstallPromptEvent = Event & {
  readonly platforms: string[];
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
};

type BannerMode = "install" | "update";

export function PwaInstallPrompt(): JSX.Element | null {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(
    null
  );
  const [mode, setMode] = useState<BannerMode | null>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as BeforeInstallPromptEvent);
      setMode("install");
      setHidden(false);
    };

    window.addEventListener(
      "beforeinstallprompt",
      handleBeforeInstallPrompt as EventListener
    );

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt as EventListener
      );
    };
  }, []);

  useEffect(() => {
    const handleSwUpdate = () => {
      setMode("update");
      setHidden(false);
    };

    window.addEventListener("eo-service-worker-updated", handleSwUpdate);
    return () => window.removeEventListener("eo-service-worker-updated", handleSwUpdate);
  }, []);

  if (hidden || (!promptEvent && mode !== "update")) {
    return null;
  }

  const handleInstall = async () => {
    if (!promptEvent) {
      return;
    }

    await promptEvent.prompt();
    await promptEvent.userChoice.finally(() => {
      setPromptEvent(null);
      setHidden(true);
    });
  };

  const handleReload = () => {
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: "SKIP_WAITING" });
    }
    window.location.reload();
  };

  const dismiss = () => setHidden(true);

  return (
    <div className="fixed bottom-6 right-6 z-[100] max-w-sm rounded-[var(--eo-radius-lg)] bg-[color:var(--eo-bg-elevated)] p-4 shadow-[var(--eo-shadow-md)]">
      {mode === "install" && promptEvent ? (
        <div className="space-y-3 text-sm text-[color:var(--eo-fg)]">
          <div>
            <h3 className="text-base font-semibold">Pasang sebagai aplikasi</h3>
            <p className="text-[color:var(--eo-muted-text)]">
              Simpan EO Scanner di layar utama untuk akses cepat di lapangan.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="md" onClick={handleInstall}>
              Pasang
            </Button>
            <Button variant="ghost" size="md" onClick={dismiss}>
              Nanti saja
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3 text-sm text-[color:var(--eo-fg)]">
          <div>
            <h3 className="text-base font-semibold">Versi baru siap</h3>
            <p className="text-[color:var(--eo-muted-text)]">
              Muat ulang untuk mendapatkan pembaruan terbaru aplikasi.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="md" onClick={handleReload}>
              Muat ulang
            </Button>
            <Button variant="ghost" size="md" onClick={dismiss}>
              Nanti saja
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
