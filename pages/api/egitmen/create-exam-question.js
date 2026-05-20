import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ ok: false, message: "Method not allowed" });
    }

    const {
      exam_id,
      question,
      option_a,
      option_b,
      option_c,
      option_d,
      correct_answer,
      points,
    } = req.body;

    if (!exam_id || !question || !option_a || !option_b) {
      return res.status(400).json({
        ok: false,
        message: "Sınav, soru, A ve B seçenekleri zorunludur.",
      });
    }

    const { data, error } = await supabaseAdmin
      .from("final_exam_questions")
      .insert({
        exam_id,
        question: question.trim(),
        option_a: option_a.trim(),
        option_b: option_b.trim(),
        option_c: option_c?.trim() || null,
        option_d: option_d?.trim() || null,
        correct_answer: correct_answer || "A",
        points: Number(points) || 10,
        created_at: new Date().toISOString(),
      })
      .select("*")
      .single();

    if (error) throw error;

    await supabaseAdmin.from("activity_logs").insert({
      activity_type: "exam_question_created",
      user_name: "Eğitmen",
      activity_text: `Sınava yeni soru eklendi (#${exam_id})`,
    });

    return res.status(200).json({ ok: true, question: data });
  } catch (error) {
    return res.status(500).json({ ok: false, message: error.message });
  }
}