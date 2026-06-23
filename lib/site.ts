export const siteName = "Virac Special";
export const siteDescription =
  "Virac Special is a coastal editorial archive sharing stories, profiles, and local chronicles from Virac and Catanduanes.";

export function getSiteUrl() {
  const rawUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    process.env.CF_PAGES_URL ||
    process.env.VERCEL_URL;

  if (!rawUrl) {
    return new URL("http://localhost:3000");
  }

  if (/^https?:\/\//i.test(rawUrl)) {
    return new URL(rawUrl);
  }

  return new URL(`https://${rawUrl}`);
}

export const siteKeywords = [
  "Virac Special",
  "Virac",
  "Catanduanes",
  "local stories",
  "editorial archive",
  "travel",
  "culture",
  "community",
];
