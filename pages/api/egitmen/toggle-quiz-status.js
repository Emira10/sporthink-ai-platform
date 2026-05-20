import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  try {
    if (req.method !== "PATCH") {
      return res.status(405).json({ ok: false, message: "Method not allowed" });
    }

    const { id, is_active } = req.body;

    if (!id) {
      return res.status(400).json({ ok: false, message: "Quiz ID gerekli." });
    }

    const status = is_active ? "published" : "draft";
    if (is_active) {
  const { count, error: countError } = await supabaseAdmin
    .from("quiz_questions")
    .select("*", { count: "exact", head: true })
    .eq("quiz_id", id);

  if (countError) throw countError;

  if (!count || count === 0) {
    return res.status(400).json({
      ok: false,
      message: "Bu quiz yayınlanamaz. Önce en az bir soru eklemelisiniz.",
    });
  }
}

    const { data, error } = await supabaseAdmin
      .from("quizzes")
      .update({
        is_active: !!is_active,
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("*")
      .single();

    if (error) throw error;

    await supabaseAdmin.from("activity_logs").insert({
      activity_type: "quiz_status_changed",
      user_name: "Eğitmen",
      activity_text: `${data.title} quiz durumu ${status} olarak güncellendi`,
    });

    return res.status(200).json({ ok: true, quiz: data });
  } catch (error) {
    return res.status(500).json({ ok: false, message: error.message });
  }
}