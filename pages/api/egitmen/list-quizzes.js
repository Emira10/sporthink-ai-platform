import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({ ok: false, message: "Method not allowed" });
    }

    const { data: quizzes, error: quizError } = await supabaseAdmin
      .from("quizzes")
      .select("*")
      .order("created_at", { ascending: false });

    if (quizError) throw quizError;

    const { data: courses, error: courseError } = await supabaseAdmin
      .from("courses_data")
      .select("id, title")
      .order("created_at", { ascending: false });

    if (courseError) throw courseError;

    const { data: questions, error: questionError } = await supabaseAdmin
      .from("quiz_questions")
      .select("quiz_id");

    if (questionError) throw questionError;

    const questionCountMap = {};
    (questions || []).forEach((q) => {
      questionCountMap[q.quiz_id] = (questionCountMap[q.quiz_id] || 0) + 1;
    });

    const courseMap = {};
    (courses || []).forEach((c) => {
      courseMap[c.id] = c;
    });

    const result = (quizzes || []).map((quiz) => ({
      ...quiz,
      real_question_count: questionCountMap[quiz.id] || 0,
      courses_data: {
        title: courseMap[quiz.course_id]?.title || "—",
      },
    }));

    return res.status(200).json({
      ok: true,
      quizzes: result,
      courses: courses || [],
    });
  } catch (error) {
    return res.status(500).json({ ok: false, message: error.message });
  }
}