import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, message: "Method not allowed" });
  }

  try {
    const {
      kullanici_id,
      course_id,
      content_type,
      watched_seconds = 0,
      total_seconds = 0,
      last_position_seconds = 0,
      reading_seconds = 0,
      last_page = 1,
      total_pages = 0,
      full_name = "",
      email = "",
    } = req.body;

    if (!kullanici_id || !course_id) {
      return res.status(400).json({ ok: false, message: "Eksik veri" });
    }

    let progressPercent = 0;
    let canComplete = false;

    if (content_type === "video") {
      progressPercent =
        total_seconds > 0 ? Math.min(100, Math.round((watched_seconds / total_seconds) * 100)) : 0;

      canComplete = progressPercent >= 90;
    }

    if (content_type === "pdf") {
      const pagePercent =
        total_pages > 0 ? Math.min(100, Math.round((last_page / total_pages) * 100)) : 0;

      const readingOk = reading_seconds >= 60;

      progressPercent = pagePercent;
      canComplete = pagePercent >= 90 && readingOk;
    }

    const status = canComplete ? "ready_to_complete" : "in_progress";

    const { data: existing } = await supabaseAdmin
      .from("user_progress")
      .select("*")
      .eq("kullanici_id", Number(kullanici_id))
      .eq("course_id", course_id)
      .maybeSingle();

    if (existing) {
      await supabaseAdmin
        .from("user_progress")
        .update({
          progress_percent: Math.max(existing.progress_percent || 0, progressPercent),
          watched_seconds: Math.max(existing.watched_seconds || 0, watched_seconds),
          total_seconds,
          last_position_seconds,
          reading_seconds: Math.max(existing.reading_seconds || 0, reading_seconds),
          last_page: Math.max(existing.last_page || 1, last_page),
          total_pages,
          can_complete: canComplete || existing.can_complete || progressPercent >= 90,
          status,
          full_name,
          email,
          learning_minutes: Math.max(
  existing.learning_minutes || 0,
  Math.ceil(Math.max(watched_seconds, reading_seconds) / 60)
),
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);
    } else {
      await supabaseAdmin.from("user_progress").insert({
        kullanici_id: Number(kullanici_id),
        course_id,
        progress_percent: progressPercent,
        status,
        full_name,
        email,
        watched_seconds,
        learning_minutes: Math.floor((watched_seconds || 0) / 60),
        total_seconds,
        last_position_seconds,
        reading_seconds,
        last_page,
        total_pages,
        can_complete: canComplete || progressPercent >= 90,
        started_at: new Date().toISOString(),
      });
    }

    await supabaseAdmin.from("learning_activity_logs").insert({
      kullanici_id: Number(kullanici_id),
      course_id,
      event_type: content_type === "pdf" ? "open_pdf" : "watch_video",
      event_value: {
        progressPercent,
        canComplete,
        watched_seconds,
        reading_seconds,
        last_page,
      },
    });

    return res.status(200).json({
  ok: true,
  progressPercent,
  canComplete: canComplete || progressPercent >= 90,
});
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: error.message,
    });
  }
}