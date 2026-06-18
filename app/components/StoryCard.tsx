type Story = {
  id?: string | number;
  slug?: string,
  title?: string;
  name?: string;
  category?: string;
  type?: string;
  published_at?: string | null;
  date?: string | null;
  created_at?: string | null;
  excerpt?: string;
  summary?: string;
  description?: string;
  thumbnail_image_url?: string;
  image_url?: string;
  cover_image?: string;
};

import Link from "next/link";

type StoryCardProps = {
  story: Story;
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

export default function StoryCard({ story }: StoryCardProps) {
  const title = story.title || story.name || "Untitled Story";
  const category = story.category || story.type || "Story";
  const date = formatDate(story.published_at || story.date || story.created_at);
  const excerpt = story.excerpt || story.summary || story.description || "No summary available.";
  const thumbnail = story.thumbnail_image_url || story.image_url || story.cover_image || null;

  return (
    <Link href={`/stories/${story.slug}`} className="block overflow-hidden">
      {thumbnail ? (
        <img src={thumbnail} alt={title} className="h-[250px] w-full object-cover" />
      ) : (
        <div className="h-[250px] w-full bg-slate-200" />
      )}
      <div className="pt-6 pr-6 pb-6">
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">
          {category}{date ? ` · ${date}` : ""}
        </p>
        <h4 className="text-xl font-semibold text-slate-900">{title}</h4>
        <p className="mt-4 text-slate-600">{excerpt}</p>
      </div>
    </Link>
  );
}
