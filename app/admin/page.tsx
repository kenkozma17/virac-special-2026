"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { signOut, useSession } from "next-auth/react";

import RichTextEditor from "@/app/components/RichTextEditor";
import { createClient } from "@/lib/supabase/client";
import {
  buildStoryMutation,
  emptyStoryForm,
  normalizeStoryRow,
  slugifyStoryTitle,
  type AdminStory,
  type StoryFormValues,
  type StoryRow,
  validateStoryValues,
} from "@/lib/stories";

function formatStoryDate(value: string) {
  if (!value) return "Draft";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function buildRequestPayload(form: StoryFormValues) {
  return {
    ...form,
    slug: slugifyStoryTitle(form.slug || form.title),
  };
}

const STORY_SELECT = "id, title, slug, category_id, author, published_at, mins_to_read, thumbnail_image_url, large_image_url, excerpt, body";

export default function AdminPage() {
  const supabase = useMemo(() => createClient(), []);
  const { data: session, status } = useSession();
  const [stories, setStories] = useState<AdminStory[]>([]);
  const [form, setForm] = useState<StoryFormValues>(emptyStoryForm);
  const [selectedStoryId, setSelectedStoryId] = useState<string | null>(null);
  const [isLoadingStories, setIsLoadingStories] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function fetchStoriesFromSupabase() {
    const { data, error } = await supabase
    .from("Stories")
    .select("*")
    .order("published_at", { ascending: false })

      console.log(data);

    if (error) {
      throw new Error(error.message);
    }

    return (data ?? []).map((story) => normalizeStoryRow(story as StoryRow));
  }

  function applyStoryToList(story: AdminStory) {
    setStories((current) => {
      const next = [...current];
      const existingIndex = next.findIndex((item) => item.id === story.id);

      if (existingIndex >= 0) {
        next[existingIndex] = story;
      } else {
        next.unshift(story);
      }

      return next.sort((left, right) => {
        const leftValue = left.publishedAt || left.createdAt || "";
        const rightValue = right.publishedAt || right.createdAt || "";
        return rightValue.localeCompare(leftValue);
      });
    });
  }

  useEffect(() => {
    if (!session?.user) {
      return;
    }

    let isActive = true;

    async function loadStories() {
      setIsLoadingStories(true);
      setError(null);

      try {
        const loadedStories = await fetchStoriesFromSupabase();

        if (isActive) {
          setStories(loadedStories);
          setIsLoadingStories(false);
        }
      } catch (loadError) {
        if (isActive) {
          setError(loadError instanceof Error ? loadError.message : "Unable to load stories.");
          setIsLoadingStories(false);
        }
      }
    }

    loadStories();

    return () => {
      isActive = false;
    };
  }, [session?.user, supabase]);

  function handleFieldChange<Key extends keyof StoryFormValues>(field: Key, value: StoryFormValues[Key]) {
    setForm((current) => {
      if (field === "title") {
        const nextTitle = String(value);
        const shouldRegenerateSlug = !current.slug || current.slug === slugifyStoryTitle(current.title);
        return {
          ...current,
          title: nextTitle,
          slug: shouldRegenerateSlug ? slugifyStoryTitle(nextTitle) : current.slug,
        };
      }

      if (field === "slug") {
        return {
          ...current,
          slug: slugifyStoryTitle(String(value)),
        };
      }

      return {
        ...current,
        [field]: value,
      };
    });
  }

  function resetComposer() {
    setSelectedStoryId(null);
    setForm(emptyStoryForm());
    setError(null);
    setSuccess(null);
  }

  function startEditing(story: AdminStory) {
    setSelectedStoryId(story.id);
    setForm({
      title: story.title,
      slug: story.slug,
      categoryId: story.categoryId,
      author: story.author,
      publishedAt: story.publishedAt,
      minsToRead: story.minsToRead,
      thumbnailImageUrl: story.thumbnailImageUrl,
      largeImageUrl: story.largeImageUrl,
      excerpt: story.excerpt,
      body: story.body,
    });
    setError(null);
    setSuccess(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSaving(true);

    try {
      const payload = buildRequestPayload(form);
      const validationErrors = validateStoryValues(payload);
      if (validationErrors.length > 0) {
        setError(validationErrors[0]);
        return;
      }

      const mutation = buildStoryMutation(payload);

      if (selectedStoryId) {
        const storyId = Number(selectedStoryId);
        if (Number.isNaN(storyId)) {
          setError("Invalid story ID.");
          return;
        }

        const { data, error: updateError } = await supabase
          .from("Stories")
          .update(mutation)
          .eq("id", storyId)
          .select(STORY_SELECT)
          .single();

        if (updateError) {
          setError(updateError.message || "Unable to update story.");
          return;
        }

        const normalizedStory = normalizeStoryRow(data as StoryRow);
        applyStoryToList(normalizedStory);
        startEditing(normalizedStory);
      } else {
        const { data, error: createError } = await supabase
          .from("Stories")
          .insert(mutation)
          .select(STORY_SELECT)
          .single();

        if (createError) {
          setError(createError.message || "Unable to create story.");
          return;
        }

        const normalizedStory = normalizeStoryRow(data as StoryRow);
        applyStoryToList(normalizedStory);
        startEditing(normalizedStory);
      }

      setSuccess(selectedStoryId ? "Story updated." : "Story created.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save story.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!selectedStoryId) {
      return;
    }

    const confirmed = window.confirm("Delete this story? This cannot be undone.");
    if (!confirmed) {
      return;
    }

    setError(null);
    setSuccess(null);
    setIsDeleting(true);

    try {
      const storyId = Number(selectedStoryId);
      if (Number.isNaN(storyId)) {
        setError("Invalid story ID.");
        return;
      }

      const { error: deleteError } = await supabase
        .from("Stories")
        .delete()
        .eq("id", storyId);

      if (deleteError) {
        setError(deleteError.message || "Unable to delete story.");
        return;
      }

      setStories((current) => current.filter((story) => story.id !== selectedStoryId));
      resetComposer();
      setSuccess("Story deleted.");
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Unable to delete story.");
    } finally {
      setIsDeleting(false);
    }
  }

  if (status === "loading") {
    return <p className="p-8">Loading…</p>;
  }

  if (!session?.user) {
    return (
      <main className="min-h-screen bg-white py-24">
        <div className="mx-auto max-w-2xl px-6">
          <h1 className="text-2xl text-black font-semibold">Admin dashboard</h1>
          <p className="mt-4 text-slate-700">
            You must be signed in to access the admin dashboard. Please <Link href="/sign-up" className="text-slate-900 underline">sign in</Link>.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white py-12">
      <div className="mx-auto max-w-7xl px-6 pt-[120px]">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl text-black font-semibold">Admin dashboard</h1>
            <p className="mt-2 text-slate-700">Signed in as <strong>{session.user.email}</strong></p>
          </div>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="rounded-md bg-slate-900 px-5 py-2 text-sm font-semibold text-white"
          >
            Sign out
          </button>
        </div>

        <section className="mt-8 grid gap-8 lg:grid-cols-[0.95fr_1.45fr]">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Stories</h2>
                <p className="mt-1 text-sm text-slate-600">Select a story to edit it, or start a new draft.</p>
              </div>
              <button
                type="button"
                onClick={resetComposer}
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
              >
                New story
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {isLoadingStories ? (
                <p className="text-sm text-slate-500">Loading stories…</p>
              ) : stories.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-5 text-sm text-slate-500">No stories found yet.</p>
              ) : (
                stories.map((story) => (
                  <button
                    key={story.id}
                    type="button"
                    onClick={() => startEditing(story)}
                    className={"block w-full rounded-2xl border px-4 py-4 text-left transition " + (selectedStoryId === story.id ? "border-slate-900 bg-white shadow-sm" : "border-slate-200 bg-white hover:border-slate-300")}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                          {story.categoryId ? `Category ${story.categoryId}` : "No category"}
                        </p>
                        <h3 className="mt-2 text-lg font-semibold text-slate-900">{story.title || "Untitled story"}</h3>
                      </div>
                      <span className="shrink-0 text-xs uppercase tracking-[0.18em] text-slate-400">{formatStoryDate(story.publishedAt || story.createdAt)}</span>
                    </div>
                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">{story.excerpt || "No excerpt yet."}</p>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">{selectedStoryId ? "Edit story" : "Create story"}</h2>
                <p className="mt-1 text-sm text-slate-600">Write in rich text, then save directly to Supabase.</p>
              </div>
              {selectedStoryId ? (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting || isSaving}
                  className="rounded-xl border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isDeleting ? "Deleting…" : "Delete story"}
                </button>
              ) : null}
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-slate-700">Title</label>
                  <input
                    id="title"
                    type="text"
                    value={form.title}
                    onChange={(event) => handleFieldChange("title", event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="slug" className="block text-sm font-medium text-slate-700">Slug</label>
                  <input
                    id="slug"
                    type="text"
                    value={form.slug}
                    onChange={(event) => handleFieldChange("slug", event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="author" className="block text-sm font-medium text-slate-700">Author</label>
                  <input
                    id="author"
                    type="text"
                    value={form.author}
                    onChange={(event) => handleFieldChange("author", event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                  />
                </div>

                <div>
                  <label htmlFor="categoryId" className="block text-sm font-medium text-slate-700">Category ID</label>
                  <input
                    id="categoryId"
                    type="number"
                    min="1"
                    value={form.categoryId}
                    onChange={(event) => handleFieldChange("categoryId", event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                  />
                </div>

                <div>
                  <label htmlFor="publishedAt" className="block text-sm font-medium text-slate-700">Published at</label>
                  <input
                    id="publishedAt"
                    type="datetime-local"
                    value={form.publishedAt}
                    onChange={(event) => handleFieldChange("publishedAt", event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                  />
                </div>

                <div>
                  <label htmlFor="minsToRead" className="block text-sm font-medium text-slate-700">Minutes to read</label>
                  <input
                    id="minsToRead"
                    type="number"
                    min="0"
                    value={form.minsToRead}
                    onChange={(event) => handleFieldChange("minsToRead", event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                  />
                </div>

                <div>
                  <label htmlFor="thumbnailImageUrl" className="block text-sm font-medium text-slate-700">Thumbnail image URL</label>
                  <input
                    id="thumbnailImageUrl"
                    type="url"
                    value={form.thumbnailImageUrl}
                    onChange={(event) => handleFieldChange("thumbnailImageUrl", event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                  />
                </div>

                <div>
                  <label htmlFor="largeImageUrl" className="block text-sm font-medium text-slate-700">Large image URL</label>
                  <input
                    id="largeImageUrl"
                    type="url"
                    value={form.largeImageUrl}
                    onChange={(event) => handleFieldChange("largeImageUrl", event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="excerpt" className="block text-sm font-medium text-slate-700">Excerpt</label>
                <textarea
                  id="excerpt"
                  value={form.excerpt}
                  onChange={(event) => handleFieldChange("excerpt", event.target.value)}
                  rows={4}
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Body</label>
                <div className="admin-editor mt-2 overflow-hidden rounded-2xl border border-slate-300 bg-white">
                  <RichTextEditor value={form.body} onChange={(value) => handleFieldChange("body", value)} />
                </div>
              </div>

              {(error || success) ? (
                <div className={"rounded-2xl border px-4 py-3 text-sm " + (error ? "border-red-300 bg-red-50 text-red-700" : "border-emerald-300 bg-emerald-50 text-emerald-700")}>
                  {error || success}
                </div>
              ) : null}

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  disabled={isSaving || isDeleting}
                  className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSaving ? "Saving…" : selectedStoryId ? "Save changes" : "Create story"}
                </button>
                <button
                  type="button"
                  onClick={resetComposer}
                  disabled={isSaving || isDeleting}
                  className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Clear form
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
