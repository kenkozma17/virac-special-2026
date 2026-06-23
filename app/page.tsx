import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import StoryCard from "./components/StoryCard";
import { siteDescription, siteName } from "@/lib/site";

const HERO_VIDEO_URL =
  "https://agszpdvdluqjwfhjjtzl.supabase.co/storage/v1/object/public/Virac%20Special/home-hero.webm";

export const metadata: Metadata = {
  description: siteDescription,
  openGraph: {
    title: siteName,
    description: siteDescription,
    type: "website",
  },
};

async function getRecentStories() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("Stories")
    .select("*")
    .order("published_at", { ascending: false })
    .limit(3);

  if (error) {
    console.error("Supabase recent stories error:", error);
    return [];
  }

  return data ?? [];
}

export default async function Home() {
  const recentStories = await getRecentStories();

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-slate-900 text-white">
      <section className="relative z-10 flex min-h-screen w-full items-center justify-center px-6 py-12 sm:px-10">
        <div className="max-w-3xl text-center z-10">
          <p className="mb-4 text-sm uppercase tracking-[0.35em] text-slate-200/90">
            The Pulse of the Island's Capital
          </p>
          <h1 className="mb-6 text-5xl font-semibold leading-tight tracking-tight text-white sm:text-6xl">
            Discover Virac Through the Stories We Share
          </h1>
          <p className="mx-auto max-w-3xl leading-8 text-slate-200/90 text-base">
            Welcome to Virac Special, a print and digital publication dedicated to the narratives of our coastal town. From hidden histories to modern lives, we map the soul of Catanduanes through the art of storytelling.
          </p>
          <div className="mt-10 flex justify-center">
            <a
              href="#recent-stories"
              className="inline-flex items-center justify-center rounded-full bg-white px-8 py-4 text-sm font-semibold uppercase tracking-[0.25em] text-slate-900 transition hover:bg-slate-100"
            >
              Read stories
            </a>
          </div>
        </div>

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_#1f2937_0%,_#0f172a_45%,_#020617_100%)]">
          <video
            className="h-full w-full object-cover"
            poster="/hero-poster.svg"
            preload="auto"
            autoPlay
            muted
            loop
            playsInline
          >
            <source src={HERO_VIDEO_URL} type="video/webm" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/60" />
        </div>
      </section>

      <section className="relative z-10 w-full bg-white px-6 py-16 text-slate-900 sm:px-10">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2 lg:items-start">
          <div className="space-y-4">
            <p className="text-sm uppercase tracking-[0.35em] text-slate-500">
              Ink & Pixels
            </p>
            <h2 className="text-3xl font-semibold leading-tight text-slate-900 sm:text-4xl">
              Crafting a Living Anthology of Our Town
            </h2>
          </div>

          <div className="text-base leading-8 text-slate-600 sm:text-lg">
            <p>
              We believe a community thrives on the tales it inherits and creates. Through our print editions and digital space, Virac Special serves as a modern archive for our town's folklore, milestones, and daily triumphs, ensuring the true voice of Virac is preserved for generations to come.
            </p>
          </div>
        </div>
      </section>

      <section id="recent-stories" className="relative z-10 w-full bg-white px-6 py-16 text-slate-900 sm:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 flex flex-col gap-4 border-b border-slate-200 pb-6 md:flex-row md:items-end md:justify-between">
            <div className="space-y-2">
              <p className="text-sm uppercase tracking-[0.35em] text-slate-500">
                recent
              </p>
              <h3 className="text-3xl font-semibold leading-tight text-slate-900 sm:text-4xl">
                Latest stories
              </h3>
            </div>
            <a href="/stories" className="text-sm font-medium uppercase tracking-[0.25em] text-slate-700 transition hover:text-slate-900">
              View all stories →
            </a>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {recentStories.length > 0 ? (
              recentStories.map((story) => (
                <StoryCard key={story.slug || story.id?.toString() || story.title} story={story} />
              ))
            ) : (
              <div className="md:col-span-3 rounded-3xl border border-slate-200 bg-slate-50 p-8 text-slate-700 shadow-sm">
                <p className="text-base">No recent stories available right now.</p>
              </div>
            )}
          </div>
        </div>
      </section>

    </main>
  );
}
