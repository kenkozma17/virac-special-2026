export type StoryRow = {
  id: number;
  title: string | null;
  slug: string | null;
  category_id: number | null;
  author: string | null;
  published_at: string | null;
  mins_to_read: number | null;
  thumbnail_image_url: string | null;
  large_image_url: string | null;
  excerpt: string | null;
  body: string | null;
  created_at?: string | null;
};

export type StoryFormValues = {
  title: string;
  slug: string;
  categoryId: string;
  author: string;
  publishedAt: string;
  minsToRead: string;
  thumbnailImageUrl: string;
  largeImageUrl: string;
  excerpt: string;
  body: string;
};

export type AdminStory = StoryFormValues & {
  id: string;
  createdAt: string;
};

export function slugifyStoryTitle(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

export function emptyStoryForm(): StoryFormValues {
  return {
    title: "",
    slug: "",
    categoryId: "",
    author: "",
    publishedAt: "",
    minsToRead: "",
    thumbnailImageUrl: "",
    largeImageUrl: "",
    excerpt: "",
    body: "",
  };
}

function toStringValue(value: unknown) {
  return typeof value === "string" ? value : value == null ? "" : String(value);
}

function toDateTimeLocalValue(value: string | null | undefined) {
  if (!value) return "";
  const normalized = value.replace(" ", "T");
  return normalized.slice(0, 16);
}

export function normalizeStoryRow(row: StoryRow): AdminStory {
  return {
    id: String(row.id),
    title: toStringValue(row.title),
    slug: toStringValue(row.slug),
    categoryId: row.category_id == null ? "" : String(row.category_id),
    author: toStringValue(row.author),
    publishedAt: toDateTimeLocalValue(row.published_at),
    minsToRead: row.mins_to_read == null ? "" : String(row.mins_to_read),
    thumbnailImageUrl: toStringValue(row.thumbnail_image_url),
    largeImageUrl: toStringValue(row.large_image_url),
    excerpt: toStringValue(row.excerpt),
    body: toStringValue(row.body),
    createdAt: toStringValue(row.created_at),
  };
}

function nullableString(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export function buildStoryMutation(values: StoryFormValues) {
  const title = values.title.trim();
  const slug = slugifyStoryTitle(values.slug || values.title);
  const categoryId = values.categoryId.trim();
  const minsToRead = values.minsToRead.trim();

  return {
    title,
    slug,
    category_id: categoryId ? Number(categoryId) : null,
    author: nullableString(values.author),
    published_at: nullableString(values.publishedAt),
    mins_to_read: minsToRead ? Number(minsToRead) : null,
    thumbnail_image_url: nullableString(values.thumbnailImageUrl),
    large_image_url: nullableString(values.largeImageUrl),
    excerpt: nullableString(values.excerpt),
    body: nullableString(values.body),
  };
}

export function validateStoryValues(values: StoryFormValues) {
  const errors: string[] = [];

  if (!values.title.trim()) {
    errors.push("Title is required.");
  }

  const slug = slugifyStoryTitle(values.slug || values.title);
  if (!slug) {
    errors.push("Slug is required.");
  }

  if (values.categoryId.trim() && Number.isNaN(Number(values.categoryId))) {
    errors.push("Category ID must be a number.");
  }

  if (values.minsToRead.trim() && Number.isNaN(Number(values.minsToRead))) {
    errors.push("Minutes to read must be a number.");
  }

  return errors;
}
