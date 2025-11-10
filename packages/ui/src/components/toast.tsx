"use client";

import { Toaster as SonnerToaster } from "sonner";

/**
 * Toast notification provider using Sonner.
 * Place this in your root layout to enable toast notifications throughout the app.
 */
export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      toastOptions={{
        style: {
          background: "var(--eo-bg-elevated)",
          color: "var(--eo-fg)",
          border: "1px solid var(--eo-muted)",
          borderRadius: "var(--eo-radius-md)",
          fontSize: "var(--eo-text-sm)",
          boxShadow: "var(--eo-shadow-md)",
        },
        className: "eo-toast",
      }}
      richColors
    />
  );
}

// Re-export toast function for convenience
export { toast } from "sonner";
