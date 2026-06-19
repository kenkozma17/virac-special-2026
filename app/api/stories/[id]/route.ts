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

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const unauthorized = await requireSession();
    if (unauthorized) {
      return unauthorized;
    }

    const { id } = await context.params;
    const values = (await request.json()) as StoryFormValues;
    const validationErrors = validateStoryValues(values);
    if (validationErrors.length > 0) {
      return NextResponse.json({ error: validationErrors[0] }, { status: 400 });
    }

    const supabase = createClient();
    const { data: existing, error: existingError } = await supabase
      .from("Stories")
      .select("slug")
      .eq("id", id)
      .single();

    if (existingError) {
      return NextResponse.json({ error: existingError.message }, { status: 404 });
    }

    const { data, error } = await supabase
      .from("Stories")
      .update(buildStoryMutation(values))
      .eq("id", id)
      .select("id, title, slug, category_id, author, published_at, mins_to_read, thumbnail_image_url, large_image_url, excerpt, body, created_at")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    revalidatePath("/");
    revalidatePath("/stories");
    if (existing?.slug) {
      revalidatePath(`/stories/${existing.slug}`);
    }
    if (data.slug) {
      revalidatePath(`/stories/${data.slug}`);
    }

    return NextResponse.json({ story: normalizeStoryRow(data as StoryRow) });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unexpected server error." },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const unauthorized = await requireSession();
    if (unauthorized) {
      return unauthorized;
    }

    const { id } = await context.params;
    const supabase = createClient();

    const { data: existing, error: existingError } = await supabase
      .from("Stories")
      .select("slug")
      .eq("id", id)
      .single();

    if (existingError) {
      return NextResponse.json({ error: existingError.message }, { status: 404 });
    }

    const { error } = await supabase
      .from("Stories")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    revalidatePath("/");
    revalidatePath("/stories");
    if (existing?.slug) {
      revalidatePath(`/stories/${existing.slug}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unexpected server error." },
      { status: 500 }
    );
  }
}
