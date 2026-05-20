import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ ok: false, message: "Method not allowed" });
    }

    const { title, course_id, question_count = 10, passing_score = 70, duration_minutes = 20, max_attempts = 1 } = req.body;

    if (!title || !course_id) {
      return res.status(400).json({ ok: false, message: "Quiz başlığı ve kurs zorunludur." });
    }

    const { data, error } = await supabaseAdmin
      .from("quizzes")
      .insert({
        title,
        course_id,
        question_count: Number(question_count),
        passing_score: Number(passing_score),
        duration_minutes: Number(duration_minutes),
        max_attempts: Number(max_attempts),
        status: "draft",
        is_active: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select("*")
      .single();

    if (error) throw error;

    await supabaseAdmin.from("activity_logs").insert({
      activity_type: "quiz_created",
      user_name: "Eğitmen",
      activity_text: `${title} quiz taslağı oluşturuldu`,
    });

    return res.status(200).json({ ok: true, quiz: data });
  } catch (error) {
    return res.status(500).json({ ok: false, message: error.message });
  }
}