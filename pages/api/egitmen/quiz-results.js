import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({ ok: false, message: "Method not allowed" });
    }

    const { data: attempts, error: attemptsError } = await supabaseAdmin
      .from("quiz_attempts")
      .select("*")
      .order("created_at", { ascending: false });

    if (attemptsError) throw attemptsError;

    const { data: quizzes, error: quizzesError } = await supabaseAdmin
      .from("quizzes")
      .select("id, title, passing_score");

    if (quizzesError) throw quizzesError;

    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name, email");

    if (profilesError) throw profilesError;

    const quizMap = {};
    (quizzes || []).forEach((q) => {
      quizMap[q.id] = q;
    });

    const profileMap = {};
    (profiles || []).forEach((p) => {
      profileMap[p.id] = p;
    });

    const results = (attempts || []).map((r) => {
      const quiz = quizMap[r.quiz_id];
      const profile = profileMap[r.user_id];

      const passingScore = quiz?.passing_score || 70;
      const percent =
        r.total_questions > 0
          ? Math.round((r.score / r.total_questions) * 100)
          : 0;

      return {
        id: r.id,
        quiz_id: r.quiz_id,
        quiz_title: quiz?.title || "Quiz",
        student_name: profile?.full_name || profile?.email || "Bilinmiyor",
        score: r.score,
        total_questions: r.total_questions,
        percent,
        passed: percent >= passingScore,
        created_at: r.created_at,
      };
    });

    const { data: finalResults, error: finalError } = await supabaseAdmin
  .from("final_exam_results")
  .select("*")
  .order("created_at", { ascending: false });

if (finalError) throw finalError;

const formattedFinals = (finalResults || []).map((r) => ({
  id: r.id,
  quiz_id: r.exam_id,
  quiz_title: `${r.exam_type || "Final Exam"} • ${
    r.exam_title || "Başlıksız Sınav"
  }`,
  student_name: r.student_name || "Bilinmiyor",
  score: r.score || 0,
  total_questions: r.total_questions || 100,
  percent:
    r.total_points > 0
      ? Math.round((r.score / r.total_points) * 100)
      : r.score || 0,
  passed: r.is_passed || false,
  created_at: r.created_at,
}));

    return res.status(200).json({
  ok: true,
  results: [...formattedFinals, ...results],
});
  } catch (error) {
    return res.status(500).json({ ok: false, message: error.message });
  }
}