import { supabaseAdmin } from "../config/database";

export async function listTopics(publishedOnly = true) {
  try {
    let query = supabaseAdmin
      .from("topics")
      .select("*")
      .order("created_at", { ascending: true });

    // Note: topics table doesn't have is_published column, skip filter
    // if (publishedOnly) {
    //   query = query.eq('is_published', true);
    // }

    const { data, error } = await query;
    if (error) {
      console.error("Error fetching topics:", error);
      throw error;
    }

    // Get lesson count for each topic separately (only published lessons)
    const topics = await Promise.all(
      (data || []).map(async (topic: any) => {
        const { count } = await supabaseAdmin
          .from("lessons")
          .select("*", { count: "exact", head: true })
          .eq("topic_id", topic.id)
          .eq("is_published", true);

        return {
          ...topic,
          lesson_count: count || 0,
        };
      })
    );

    return topics;
  } catch (error) {
    console.error("Error in listTopics:", error);
    throw error;
  }
}

export async function getTopic(id: string) {
  const { data, error } = await supabaseAdmin
    .from("topics")
    .select(
      "*, lessons(id, title, slug, content_markdown, difficulty, display_order)"
    )
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }

  return data;
}
