import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false });
  }

  try {
    const {
      survey_id,
      user_id,
      user_name,
      answer_1,
      answer_2,
      answer_3,
      comment,
    } = req.body;

    const { data, error } = await supabaseAdmin
      .from("survey_answers")
      .insert({
        survey_id,
        user_id,
        user_name,
        answer_1,
        answer_2,
        answer_3,
        comment,
      })
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json({
      ok: true,
      data,
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: err.message,
    });
  }
}