"use client";

import { Toaster as Sonner } from "sonner";

export function Toaster() {
  return (
    <Sonner
      position="bottom-center"
      toastOptions={{
        style: {
          background: "var(--surface-raised)",
          border: "1px solid var(--border)",
          color: "var(--text)",
          fontSize: "0.8125rem",
          fontFamily: "var(--font-sans), system-ui, sans-serif",
          borderRadius: "0.5rem",
          padding: "0.75rem 1rem",
          boxShadow: "0 8px 32px rgba(0,0,0,0.48)",
        },
        className: "sonner-toast",
      }}
      expand={false}
      visibleToasts={4}
      gap={8}
      closeButton
      richColors={false}
      duration={4000}
    />
  );
}
