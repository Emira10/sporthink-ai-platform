import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  try {
    const { feedback_id } = req.body;

    if (!feedback_id) {
      return res.status(400).json({
        error: "feedback_id gerekli",
      });
    }

    const { error } = await supabaseAdmin
      .from("feedbacks")
      .delete()
      .eq("id", feedback_id)
      .is("trainer_reply", null);

    if (error) {
      return res.status(500).json({
        error: error.message,
      });
    }

    return res.status(200).json({
      success: true,
    });
  } catch (err) {
    return res.status(500).json({
      error: err.message,
    });
  }
}