import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  try {
    if (req.method !== "PATCH") {
      return res.status(405).json({ ok: false, message: "Method not allowed" });
    }

    const { id, title, course_id, question_count, passing_score } = req.body;

    if (!id) {
      return res.status(400).json({ ok: false, message: "Quiz ID gerekli." });
    }

    if (!title || !course_id) {
      return res.status(400).json({ ok: false, message: "Başlık ve kurs zorunludur." });
    }

    const { data, error } = await supabaseAdmin
      .from("quizzes")
      .update({
        title: title.trim(),
        course_id,
        question_count: Number(question_count) || 0,
        passing_score: Number(passing_score) || 70,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("*")
      .single();

    if (error) throw error;

    await supabaseAdmin.from("activity_logs").insert({
      activity_type: "quiz_updated",
      user_name: "Eğitmen",
      activity_text: `${data.title} quiz bilgileri güncellendi`,
    });

    return res.status(200).json({ ok: true, quiz: data });
  } catch (error) {
    return res.status(500).json({ ok: false, message: error.message });
  }
}