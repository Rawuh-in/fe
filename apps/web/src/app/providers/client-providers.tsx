"use client";

import { Fragment, type ReactNode } from "react";
import type { JSX } from "react";
import { PwaInstallPrompt } from "./pwa-install-prompt";
import { QueryProvider } from "./query-provider";
import { ServiceWorkerProvider } from "./service-worker-provider";

interface ClientProvidersProps {
  children: ReactNode;
}

export function ClientProviders({ children }: ClientProvidersProps): JSX.Element {
  return (
    <QueryProvider>
      {children}
      <Fragment>
        <ServiceWorkerProvider />
        <PwaInstallPrompt />
      </Fragment>
    </QueryProvider>
  );
}
