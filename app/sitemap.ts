import type { MetadataRoute } from "next";

import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/site";

type StoryRow = {
  slug: string;
  published_at: string | null;
  created_at: string | null;
};

async function getStoryRoutes() {
  const supabase = createClient();
  const { data } = await supabase
    .from("Stories")
    .select("slug, published_at, created_at")
    .order("published_at", { ascending: false });

  return (data ?? []) as StoryRow[];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const stories = await getStoryRoutes();

  const routes: MetadataRoute.Sitemap = [
    {
      url: new URL("/", siteUrl).toString(),
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: new URL("/stories", siteUrl).toString(),
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  for (const story of stories) {
    routes.push({
      url: new URL(`/stories/${story.slug}`, siteUrl).toString(),
      lastModified: story.published_at || story.created_at || new Date().toISOString(),
      changeFrequency: "monthly",
      priority: 0.7,
    });
  }

  return routes;
}
