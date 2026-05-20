import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  if (req.method !== "DELETE") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed",
    });
  }

  try {
    const { feedback_id } = req.body;

    if (!feedback_id) {
      return res.status(400).json({
        success: false,
        error: "feedback_id zorunludur.",
      });
    }

    const { error } = await supabaseAdmin
      .from("feedbacks")
      .delete()
      .eq("id", feedback_id);

    if (error) {
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }

    await updateInstructorActivity(supabaseAdmin, "test@test.com");


    return res.status(200).json({
      success: true,
      ok: true,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message || "Sunucu hatası",
    });
  }
}