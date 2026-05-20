import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { quiz_id, user_id, student_name, answers } = req.body;

    if (!quiz_id || !user_id || !answers) {
      return res.status(400).json({ error: "quiz_id, user_id ve answers gerekli" });
    }

    const { data: questions, error: questionError } = await supabaseAdmin
      .from("quiz_questions")
      .select("id, correct_answer")
      .eq("quiz_id", quiz_id);

    if (questionError) throw questionError;

    let correctCount = 0;

    questions.forEach((q) => {
      if (answers[q.id] === q.correct_answer) {
        correctCount++;
      }
    });

    const totalQuestions = questions.length;
    const score = totalQuestions
      ? Math.round((correctCount / totalQuestions) * 100)
      : 0;

    const earnedXP = score >= 70 ? 500 : Math.round(score * 2);

    const { error: attemptError } = await supabaseAdmin
      .from("quiz_attempts")
      .insert([
        {
  quiz_id,
  user_id,
  student_name: student_name || "Kullanıcı",
  score: correctCount,
  total_questions: totalQuestions,
  percent: score,
  created_at: new Date().toISOString(),
},
      ]);

    if (attemptError) throw attemptError;

    const { error: pointError } = await supabaseAdmin
      .from("user_points")
      .insert([
        {
          user_id,
          student_name: student_name || "Kullanıcı",
          points: earnedXP,
          source: "doctor_big_quiz",
        },
      ]);

    if (pointError) throw pointError;

    return res.status(200).json({
      success: true,
      score,
      correctCount,
      totalQuestions,
      earnedXP,
    });
  } catch (err) {
    console.error("quiz-submit api error:", err);
    return res.status(500).json({ error: err.message });
  }
}