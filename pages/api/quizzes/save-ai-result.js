import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({
        ok: false,
        error: "Method not allowed",
      });
    }

    const {
      kullanici_id,
      course_id,
      score,
      correct_count,
      total_questions,
    } = req.body;

    if (!kullanici_id || !course_id) {
      return res.status(400).json({
        ok: false,
        error: "Eksik veri",
      });
    }

    const quizScore = Number(score || 0);

    const { data: student } = await supabaseAdmin
      .from("kullanicilar")
      .select("ad, soyad, e_posta")
      .eq("kullanici_id", Number(kullanici_id))
      .maybeSingle();

    const studentName = student
      ? `${student.ad || ""} ${student.soyad || ""}`.trim() || student.e_posta
      : "Öğrenci";

    const { data, error } = await supabaseAdmin
      .from("quiz_results")
      .insert({
        kullanici_id: Number(kullanici_id),
        ai_course_id: String(course_id),

        full_name: studentName,
        quiz_title: "AI Sınavı",
        quiz_type: "AI QUIZ",

        score: quizScore,
        correct_count: Number(correct_count || 0),
        total_questions: Number(total_questions || 0),
        source: "ai",
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    await supabaseAdmin.from("activity_logs").insert({
      activity_type: quizScore >= 60 ? "quiz_success" : "quiz_failed",
      user_name: studentName,
      activity_text:
        quizScore >= 60
          ? `${studentName} AI quiz sınavından %${quizScore} başarı elde etti`
          : `${studentName} AI quiz sınavından %${quizScore} sonuç aldı`,
    });

    return res.status(200).json({
      ok: true,
      result: data,
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: err.message,
    });
  }
}