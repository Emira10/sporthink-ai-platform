import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
    });
  }

  try {
    const { kullanici_id, mood, message } = req.body;

    if (!kullanici_id || !mood) {
      return res.status(400).json({
        success: false,
        message: "Eksik veri",
      });
    }

    await supabaseAdmin
      .from("user_learning_profile")
      .update({
        mood,
        updated_at: new Date().toISOString(),
      })
      .eq("kullanici_id", kullanici_id);

    await supabaseAdmin
      .from("ai_coach_logs")
      .insert({
        kullanici_id,
        mood,
        message,
      });

    return res.status(200).json({
      success: true,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}