"use client";

import { useEffect, useRef } from "react";
import { Workbox } from "workbox-window";

const SERVICE_WORKER_URL = "/sw.js";

export function ServiceWorkerProvider(): null {
  const workboxRef = useRef<Workbox | null>(null);
  const registerPromiseRef = useRef<Promise<unknown> | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    if (!workboxRef.current) {
      workboxRef.current = new Workbox(SERVICE_WORKER_URL, {
        scope: "/"
      });
    }

    const wb = workboxRef.current;
    if (!wb) {
      return;
    }

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

    if (!registerPromiseRef.current) {
      registerPromiseRef.current = wb.register().catch((error) => {
        console.error("Service worker registration failed", error);
        registerPromiseRef.current = null;
      });
    }

    return () => {
      wb.removeEventListener("waiting", handleWaiting);
      wb.removeEventListener("activated", handleActivated);
    };
  }, []);

  return null;
}
