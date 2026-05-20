import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({ ok: false, message: "Method not allowed" });
    }

    const { count: examsCount } = await supabaseAdmin
      .from("final_exams")
      .select("*", { count: "exact", head: true });

    const { count: surveysCount } = await supabaseAdmin
      .from("training_surveys")
      .select("*", { count: "exact", head: true });

    const { count: resultsCount } = await supabaseAdmin
      .from("final_exam_results")
      .select("*", { count: "exact", head: true });

    const { count: questionsCount } = await supabaseAdmin
      .from("final_exam_questions")
      .select("*", { count: "exact", head: true });

    const { data: results } = await supabaseAdmin
      .from("final_exam_results")
      .select("score")
      .limit(1000);

    const scores = (results || [])
      .map((r) => Number(r.score))
      .filter((n) => !Number.isNaN(n));

    const averageScore =
      scores.length > 0
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : 0;

        const { data: latestExam } = await supabaseAdmin
  .from("final_exams")
  .select("title, created_at")
  .order("created_at", { ascending: false })
  .limit(1)
  .maybeSingle();

const passedCount = scores.filter((s) => s >= 60).length;

const passRate =
  scores.length > 0
    ? Math.round((passedCount / scores.length) * 100)
    : 0;

const highestScore =
  scores.length > 0
    ? Math.max(...scores)
    : 0;

    return res.status(200).json({
      ok: true,
      stats: {
        examsCount: examsCount || 0,
        surveysCount: surveysCount || 0,
        resultsCount: resultsCount || 0,
        questionsCount: questionsCount || 0,
        averageScore,
        latestExamTitle: latestExam?.title || "Henüz sınav yok",
        highestScore,
        passedCount,
        passRate,
      },
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: error.message,
    });
  }
}