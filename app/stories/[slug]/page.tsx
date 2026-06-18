import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";

type Story = {
  id?: string | number;
  slug?: string;
  title?: string;
  name?: string;
  category?: string;
  type?: string;
  author?: string;
  published_date?: string | null;
  published_at?: string | null;
  date?: string | null;
  created_at?: string | null;
  mins_to_read?: number | string | null;
  large_image_url?: string | null;
  thumbnail_url?: string;
  image_url?: string;
  cover_image?: string;
  excerpt?: string;
  summary?: string;
  description?: string;
  content?: string;
  body?: string;
};

function formatDate(value: string | null | undefined) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatISODate(value: string | null | undefined) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
}

async function getStory(slug: string) {
  const supabase = createClient();
  const { data: story, error } = await supabase
    .from("Stories")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) {
    return null;
  }

  return story as Story | null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const story = await getStory(slug);
  if (!story) {
    return {
      title: "Story not found | Virac",
      description: "The requested story could not be found.",
    };
  }

  const title = story.title || story.name || "Untitled Story";
  const description = story.description || story.excerpt || story.summary || `Read ${title} on Virac.`;
  const image = story.large_image_url || story.thumbnail_url || story.image_url || story.cover_image;
  const publishedAt = story.published_at || story.published_date || story.created_at;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      images: image ? [{ url: image }] : undefined,
      article: {
        publishedTime: publishedAt || undefined,
        authors: story.author ? [story.author] : undefined,
        section: story.category || story.type || undefined,
      },
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function StoryDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const story = await getStory(slug);

  if (!story) {
    notFound();
  }

  const heroImage = story.large_image_url || story.thumbnail_url || story.image_url || "";
  const hasImage = Boolean(heroImage);
  const publishedDate = formatDate(story.published_date || story.published_at || story.created_at);
  const publishedISO = formatISODate(story.published_date || story.published_at || story.created_at);
  const readingTime = story.mins_to_read ? `${story.mins_to_read} min read` : "";
  const author = story.author || "Unknown author";
  const excerptText = story.excerpt || story.description || story.summary || "";

  return (
    <main className="min-h-screen w-full bg-black text-white">
      <article itemScope itemType="https://schema.org/Article">
        <section className="relative h-screen w-full overflow-hidden" aria-label="Story hero section">
            {hasImage ? (
              <>
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${heroImage})` }}
                />
                <div className="absolute inset-0 bg-black/30" />
                <div className="absolute inset-0 bg-gradient-to-b from-[#F6F0FF]/40 to-white/0" />
              </>
            ) : (
              <div className="absolute inset-0 bg-gradient-to-b from-[#F6F0FF] to-white" />
            )}

          <div className="relative z-10 h-full w-full">
            <div className="absolute inset-x-6 top-[100px] sm:inset-x-10 sm:top-[100px]">
              <div className="mx-auto flex max-w-6xl">
                <Link
                  href="/stories"
                  className={hasImage ? "text-sm font-medium uppercase tracking-[0.25em] text-white transition hover:text-slate-200" : "text-sm font-medium uppercase tracking-[0.25em] text-slate-700 transition hover:text-slate-900"}
                >
                  ← Back to stories
                </Link>
              </div>
            </div>

            <header className="absolute inset-x-6 bottom-[100px] sm:inset-x-10">
              <div className="mx-auto w-full max-w-6xl">
                <div className="max-w-3xl">
                  <p className={hasImage ? "text-sm uppercase tracking-[0.35em] text-slate-300" : "text-sm uppercase tracking-[0.35em] text-slate-600"}>
                    <span itemProp="articleSection">{story.category || story.type || "Story"}</span>
                    {publishedDate ? ` · ${publishedDate}` : ""}
                    {readingTime ? ` · ${readingTime}` : ""}
                  </p>
                  <h1 itemProp="headline" className={"mt-4 text-4xl font-semibold leading-tight sm:text-5xl " + (hasImage ? "text-white" : "text-slate-900")}>
                    {story.title || story.name || "Untitled Story"}
                  </h1>
                  <p className={hasImage ? "mt-4 text-sm uppercase tracking-[0.25em] text-slate-300" : "mt-4 text-sm uppercase tracking-[0.25em] text-slate-600"}>
                    <span itemProp="author" itemScope itemType="http://schema.org/Person">
                      <span itemProp="name">{author}</span>
                    </span>
                  </p>
                  {publishedISO ? <meta itemProp="datePublished" content={publishedISO} /> : null}
                  {publishedISO ? <meta itemProp="dateModified" content={publishedISO} /> : null}
                  {heroImage ? <meta itemProp="image" content={heroImage} /> : null}
                </div>
              </div>
            </header>
          </div>
        </section>

        <section className="w-full bg-white px-6 py-16 text-slate-900 sm:px-10">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-10 lg:grid-cols-[0.3fr_0.7fr]">
              <aside className="lg:sticky lg:top-36 self-start" aria-labelledby="story-excerpt-title">
                <div>
                  <div className="mt-6 space-y-6 text-slate-700">
                    <blockquote
                      id="story-excerpt-title"
                      className="text-base italic leading-8 border-l-4 border-red-600 pl-5"
                      style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
                    >
                      {excerptText || "No excerpt available."}
                    </blockquote>
                  </div>
                </div>
              </aside>

              <div className="space-y-8">
                <div className="space-y-6 text-slate-700">
                  {story.content || story.body ? (
                    <div
                      className="story-body max-w-none"
                      itemProp="articleBody"
                      dangerouslySetInnerHTML={{ __html: story.content || story.body || "" }}
                    />
                  ) : (
                    <p className="text-slate-500">No body content available.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </article>
    </main>
  );
}
