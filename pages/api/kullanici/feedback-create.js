import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      user_email,
      message,
      feedback_type = "general",
      rating = null,
      course_id = null,
      trainer_id = null,
    } = req.body;

    if (!user_email || !message) {
      return res.status(400).json({ error: "user_email ve message zorunludur." });
    }

    const { data, error } = await supabaseAdmin
      .from("feedbacks")
      .insert([
        {
          user_email,
          message,
          feedback_type,
          rating,
          course_id,
          trainer_id,
          status: "new",
        },
      ])
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({
      success: true,
      feedback: data,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}