import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ ok: false, error: "Method not allowed" });
    }

    const { kullanici_id, exam_id, exam_title, score, correct_count, total_questions } = req.body;

    if (!kullanici_id || !exam_id) {
      return res.status(400).json({ ok: false, error: "Eksik veri" });
    }

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
        full_name: studentName,
        training_id: null,
        quiz_title: exam_title || "Online Sınav",
        quiz_type: "NORMAL SINAV",
        score: Number(score || 0),
        correct_count: Number(correct_count || 0),
        total_questions: Number(total_questions || 0),
        source: "normal",
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json({ ok: true, result: data });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
}