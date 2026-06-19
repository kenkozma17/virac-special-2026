import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createClient } from "@/lib/supabase/server";
import { buildStoryMutation, normalizeStoryRow, type StoryFormValues, type StoryRow, validateStoryValues } from "@/lib/stories";

async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null;
}

export async function GET() {
  try {
    const unauthorized = await requireSession();
    if (unauthorized) {
      return unauthorized;
    }

    const supabase = createClient();
    const { data, error } = await supabase
      .from("Stories")
      .select("id, title, slug, category_id, author, published_at, mins_to_read, thumbnail_image_url, large_image_url, excerpt, body, created_at")
      .order("published_at", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ stories: (data ?? []).map((story) => normalizeStoryRow(story as StoryRow)) });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unexpected server error." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const unauthorized = await requireSession();
    if (unauthorized) {
      return unauthorized;
    }

    const values = (await request.json()) as StoryFormValues;
    const validationErrors = validateStoryValues(values);
    if (validationErrors.length > 0) {
      return NextResponse.json({ error: validationErrors[0] }, { status: 400 });
    }

    const supabase = createClient();
    const payload = buildStoryMutation(values);

    const { data, error } = await supabase
      .from("Stories")
      .insert(payload)
      .select("id, title, slug, category_id, author, published_at, mins_to_read, thumbnail_image_url, large_image_url, excerpt, body, created_at")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    revalidatePath("/");
    revalidatePath("/stories");
    revalidatePath(`/stories/${data.slug}`);

    return NextResponse.json({ story: normalizeStoryRow(data as StoryRow) }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unexpected server error." },
      { status: 500 }
    );
  }
}
