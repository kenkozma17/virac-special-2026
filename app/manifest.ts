import type { MetadataRoute } from "next";

import { getSiteUrl, siteDescription, siteName } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  const siteUrl = getSiteUrl();

  return {
    name: siteName,
    short_name: siteName,
    description: siteDescription,
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#09090b",
    icons: [
      {
        src: new URL("/favicon.ico", siteUrl).toString(),
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
