import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ ok: false, message: "Method not allowed" });
    }

    const {
      title,
      category,
      description,
      video_url,
      cover_url,
      type,
      content_type,
      difficulty,
      duration,
      is_mandatory,
      is_active,
    } = req.body;

    if (!title || !category) {
      return res.status(400).json({
        ok: false,
        message: "Başlık ve kategori zorunludur.",
      });
    }

    const { data, error } = await supabaseAdmin
      .from("courses_data")
      .insert({
        title,
        category,
        description: description || null,
        video_url: type === "Video" ? video_url || null : null,
        file_url: type !== "Video" ? video_url || null : null,
        cover_url: cover_url || null,
        type,
        content_type: content_type || String(type || "").toLowerCase(),
        difficulty: difficulty || "Başlangıç",
        duration: duration ? Number(duration) : null,
        is_mandatory: !!is_mandatory,
        is_active: is_active ?? true,
        created_at: new Date().toISOString(),
      })
      .select("*")
      .single();

    if (error) throw error;

    if (Array.isArray(req.body.lessons) && req.body.lessons.length > 0) {
  const lessonRows = req.body.lessons.map((lesson, index) => ({
    course_id: data.id,
    title: lesson.title,
    content_type: lesson.content_type,
    content_url: lesson.content_url,
    duration: lesson.duration ? Number(lesson.duration) : null,
    lesson_order: index + 1,
  }));

  await supabaseAdmin
    .from("course_lessons")
    .insert(lessonRows);
}

    await supabaseAdmin.from("activity_logs").insert({
      activity_type: "course_created",
      user_name: "Eğitmen",
      activity_text: `${title} eğitimi yayınlandı`,
    });

    return res.status(200).json({ ok: true, course: data });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: error.message,
    });
  }
}