import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed",
    });
  }

  try {
    const {
      user_id,
      student_name,
      action_type,
      action_title,
      action_desc,
      xp_earned,
    } = req.body;

    const { error } = await supabaseAdmin
      .from("user_activity_logs")
      .insert({
        user_id,
        student_name,
        action_type,
        action_title,
        action_desc,
        xp_earned: xp_earned || 0,
      });

    if (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }

    return res.status(200).json({
      success: true,
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
}