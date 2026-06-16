import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Life OS",
    short_name: "LifeOS",
    description: "Your personal operating system for health, finance, and productivity",
    start_url: "/",
    display: "standalone",
    background_color: "#030405",
    theme_color: "#030405",
    orientation: "any",
    icons: [
      {
        src: "/lifeos-logo.png",
        sizes: "any",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
