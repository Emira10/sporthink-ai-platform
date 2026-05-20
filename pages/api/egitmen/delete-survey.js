import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  try {
    if (req.method !== "DELETE") {
      return res.status(405).json({
        ok: false,
        message: "Method not allowed",
      });
    }

    const { survey_id } = req.body;

    if (!survey_id) {
      return res.status(400).json({
        ok: false,
        message: "survey_id gerekli",
      });
    }

    await supabaseAdmin
      .from("survey_answers")
      .delete()
      .eq("survey_id", survey_id);

    await supabaseAdmin
      .from("survey_questions")
      .delete()
      .eq("survey_id", survey_id);

    const { error } = await supabaseAdmin
      .from("training_surveys")
      .delete()
      .eq("id", survey_id);

    if (error) {
      throw error;
    }

    return res.status(200).json({
      ok: true,
    });
  } catch (error) {
    console.error("DELETE SURVEY ERROR:", error);

    return res.status(500).json({
      ok: false,
      message: error.message,
    });
  }
}