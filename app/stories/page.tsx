import { createClient } from "@/lib/supabase/server";
import StoryCard from "../components/StoryCard";

async function getStories() {
  const supabase = createClient();
  const { data: stories, error } = await supabase
    .from("Stories")
    .select("*")
    .order("published_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return stories ?? [];
}

export default async function StoriesPage() {
  const stories = await getStories();

  return (
    <main className="min-h-screen w-full bg-white text-slate-900">
      <section className="relative flex min-h-[70vh] w-full items-center justify-start px-6 pt-[120px] pb-16 sm:px-10 bg-gradient-to-b from-[#F6F0FF] to-white">
        <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-start text-left">
          <p className="mb-4 text-sm uppercase tracking-[0.35em] text-slate-600">
            Editorial archive
          </p>
          <h1 className="max-w-3xl text-5xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-6xl">
            Stories that blend craft, culture, and cinematic storytelling.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-slate-700 sm:text-lg">
            Explore the full collection with a clean, immersive layout. Each story is designed to stand on its own while fitting into a carefully curated editorial archive.
          </p>
          <div className="mt-16 h-px w-full max-w-6xl bg-slate-400/30" />
        </div>
      </section>

      <section className="w-full bg-white px-6 py-16 text-slate-900 sm:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 flex flex-col gap-4 border-b border-slate-200 pb-6 md:flex-row md:items-end md:justify-between">
            <div className="space-y-2">
              <p className="text-sm uppercase tracking-[0.35em] text-slate-500">recent</p>
              <h2 className="text-3xl font-semibold leading-tight text-slate-900 sm:text-4xl">
                Latest stories
              </h2>
            </div>
          </div>

          {stories.length === 0 ? (
            <p className="text-slate-600">No stories available at the moment.</p>
          ) : (
            <div className="grid gap-6 md:grid-cols-3">
              {stories.map((story: any) => (
                <StoryCard key={story.id || story.title || story.name} story={story} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
