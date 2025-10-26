"use client";

import { Fragment } from "react";
import type { JSX } from "react";
import { PwaInstallPrompt } from "./pwa-install-prompt";
import { ServiceWorkerProvider } from "./service-worker-provider";

export function ClientProviders(): JSX.Element {
  return (
    <Fragment>
      <ServiceWorkerProvider />
      <PwaInstallPrompt />
    </Fragment>
  );
}
