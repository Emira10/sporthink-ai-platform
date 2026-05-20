import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  try {
    if (req.method !== "PATCH" && req.method !== "PUT") {
      return res.status(405).json({ ok: false, message: "Method not allowed" });
    }

    const {
      course_id,
      course,
      lessons,

      title,
      category,
      description,
      cover_url,
      file_url,
      video_url,
      type,
      content_type,
      difficulty,
      duration,
      is_mandatory,
      is_active,
    } = req.body;

    const finalCourseId = course_id || course?.id;

    if (!finalCourseId) {
      return res.status(400).json({ ok: false, message: "course_id gerekli" });
    }

    const updates = {
      updated_at: new Date().toISOString(),
    };

    const source = course || req.body;

    if (source.title !== undefined) updates.title = source.title;
    if (source.category !== undefined) updates.category = source.category;
    if (source.description !== undefined) updates.description = source.description || null;
    if (source.cover_url !== undefined) updates.cover_url = source.cover_url || null;
    if (source.thumbnail_url !== undefined) updates.thumbnail_url = source.thumbnail_url || null;
    if (source.file_url !== undefined) updates.file_url = source.file_url || null;
    if (source.video_url !== undefined) updates.video_url = source.video_url || null;
    if (source.type !== undefined) updates.type = source.type;
    if (source.content_type !== undefined) updates.content_type = source.content_type || "video";
    if (source.difficulty !== undefined) updates.difficulty = source.difficulty || "Başlangıç";
    if (source.duration !== undefined) updates.duration = source.duration ? Number(source.duration) : null;
    if (source.is_mandatory !== undefined) updates.is_mandatory = !!source.is_mandatory;
    if (source.is_active !== undefined) updates.is_active = !!source.is_active;

    const { data, error } = await supabaseAdmin
      .from("courses_data")
      .update(updates)
      .eq("id", finalCourseId)
      .select("*")
      .single();

    if (error) throw error;

    if (Array.isArray(lessons)) {
      const { error: deleteError } = await supabaseAdmin
        .from("course_lessons")
        .delete()
        .eq("course_id", finalCourseId);

      if (deleteError) throw deleteError;

      const lessonRows = lessons
        .filter((lesson) => lesson.title?.trim())
        .map((lesson, index) => ({
          course_id: finalCourseId,
          title: lesson.title,
          content_type: lesson.content_type || "video",
          content_url: lesson.content_url || null,
          duration: lesson.duration ? Number(lesson.duration) : null,
          lesson_order: index + 1,
        }));

      if (lessonRows.length > 0) {
        const { error: lessonError } = await supabaseAdmin
          .from("course_lessons")
          .insert(lessonRows);

        if (lessonError) throw lessonError;
      }
    }

    await supabaseAdmin.from("activity_logs").insert({
      activity_type: "course_updated",
      user_name: "Eğitmen",
      activity_text: `${data.title} eğitimi güncellendi`,
    });

    return res.status(200).json({ ok: true, course: data });
  } catch (error) {
    return res.status(500).json({ ok: false, message: error.message });
  }
}