"use client";

import { useEffect } from "react";
import { Workbox } from "workbox-window";

const SERVICE_WORKER_URL = "/sw.js";

export function ServiceWorkerProvider(): null {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    const wb = new Workbox(SERVICE_WORKER_URL, {
      scope: "/"
    });

    const handleWaiting = () => {
      wb.messageSkipWaiting();
    };

    const handleActivated = (event: { isUpdate?: boolean }) => {
      if (event.isUpdate) {
        window.dispatchEvent(new CustomEvent("eo-service-worker-updated"));
      }
    };

    wb.addEventListener("waiting", handleWaiting);
    wb.addEventListener("activated", handleActivated);

    wb.register().catch((error) => {
      console.error("Service worker registration failed", error);
    });

    return () => {
      wb.removeEventListener("waiting", handleWaiting);
      wb.removeEventListener("activated", handleActivated);
    };
  }, []);

  return null;
}
