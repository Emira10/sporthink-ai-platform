import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false });
  }

  try {
    const { kullanici_id, course_id } = req.body;

    if (!kullanici_id || !course_id) {
      return res.status(400).json({ ok: false, message: "Eksik veri" });
    }

    let { data: progress } = await supabaseAdmin

      .from("user_progress")
      .select("*")
      .eq("kullanici_id", Number(kullanici_id))
      .eq("course_id", course_id)
      .maybeSingle();

    const { data: course } = await supabaseAdmin
  .from("courses_data")
  .select("title, content_type, file_url, video_url")
  .eq("id", course_id)
  .maybeSingle();

const type = String(course?.content_type || "").toLowerCase();
const fileUrl = String(course?.file_url || "").toLowerCase();
const isPdf = type.includes("pdf") || fileUrl.includes(".pdf");

if (!progress && isPdf) {
  const { data: inserted, error: insertError } = await supabaseAdmin
    .from("user_progress")
    .insert({
      kullanici_id: Number(kullanici_id),
      course_id,
      progress_percent: 50,
      status: "in_progress",
      can_complete: true,
      started_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (insertError) throw insertError;

  progress = inserted;
}

const canComplete =
  progress?.can_complete ||
  isPdf;

if (!canComplete) {
  return res.status(403).json({
    ok: false,
    message: isPdf
      ? "PDF okuma süresi tamamlanmadan eğitim bitirilemez."
      : "Eğitimi tamamlamak için içeriğin en az %90'ı tamamlanmalıdır.",
  });
}

    await supabaseAdmin
      .from("user_progress")
      .update({
        progress_percent: 100,
        status: "completed",
        completed_at: new Date().toISOString(),
        completion_source: "real_tracking",
        updated_at: new Date().toISOString(),
      })
      .eq("id", progress.id);

    await supabaseAdmin.from("learning_activity_logs").insert({
      kullanici_id: Number(kullanici_id),
      course_id,
      event_type: "complete_course",
      event_value: { source: "real_tracking" },
    });

    return res.status(200).json({
      ok: true,
      message: "Eğitim tamamlandı.",
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: error.message,
    });
  }
}