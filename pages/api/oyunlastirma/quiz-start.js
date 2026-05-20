import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { data: quizzes, error: quizError } = await supabaseAdmin
      .from("quizzes")
      .select("*")
      .eq("is_active", true);

    if (quizError) throw quizError;

    if (!quizzes || quizzes.length === 0) {
      return res.status(404).json({ error: "Aktif quiz bulunamadı" });
    }

    const quiz = quizzes[Math.floor(Math.random() * quizzes.length)];

    const { data: questions, error: questionError } = await supabaseAdmin
      .from("quiz_questions")
      .select("id, quiz_id, question_text, option_a, option_b, option_c, option_d")
      .eq("quiz_id", quiz.id);

    if (questionError) throw questionError;

    return res.status(200).json({
      success: true,
      quiz,
      questions: questions || [],
    });
  } catch (err) {
    console.error("quiz-start api error:", err);
    return res.status(500).json({ error: err.message });
  }
}