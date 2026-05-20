import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({
        ok: false,
        message: "Method not allowed",
      });
    }

    const {
      quiz_id,
      question_text,
      option_a,
      option_b,
      option_c,
      option_d,
      correct_answer,
      points,
    } = req.body;

    if (!quiz_id || !question_text || !option_a || !option_b) {
      return res.status(400).json({
        ok: false,
        message: "Quiz, soru, A ve B seçenekleri zorunludur.",
      });
    }

    const { data, error } = await supabaseAdmin
      .from("quiz_questions")
      .insert({
        quiz_id,
        question_text: question_text.trim(),
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

    return res.status(200).json({
      ok: true,
      question: data,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: error.message,
    });
  }
}