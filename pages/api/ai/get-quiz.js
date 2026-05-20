import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  try {
    const { course_id } = req.query;

    if (!course_id) {
      return res.status(400).json({ error: "course_id zorunlu" });
    }

    const { data, error } = await supabaseAdmin
      .from("ai_quizzes")
      .select("*")
      .eq("egitim_id", course_id)
      .order("created_at", { ascending: true });

    if (error) throw error;

    return res.status(200).json({
      ok: true,
      questions: data || [],
    });
  } catch (err) {
    console.error("GET QUIZ ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
}