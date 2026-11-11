import type { MetadataRoute } from "next";

/**
 * Makes the game installable to the home screen. For a daily-habit product
 * on Android handsets that is the cheapest retention there is.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Super Awoof",
    short_name: "Super Awoof",
    description: "Spin the reels and win big on MTN.",
    start_url: "/",
    display: "standalone",
    background_color: "#0A0C10",
    theme_color: "#0A0C10",
    orientation: "portrait",
    icons: [
      { src: "/images/favicon.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/images/favicon.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
}
