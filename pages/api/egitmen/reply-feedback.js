import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed",
    });
  }

  try {
    const { feedback_id, trainer_reply } = req.body;

    if (!feedback_id || !trainer_reply?.trim()) {
      return res.status(400).json({
        success: false,
        error: "feedback_id ve trainer_reply zorunludur.",
      });
    }

    const cleanReply = trainer_reply.trim();

    const { data, error } = await supabaseAdmin
      .from("feedbacks")
      .update({
        trainer_reply: cleanReply,
        replied_at: new Date().toISOString(),
        status: "answered",
      })
      .eq("id", feedback_id)
      .select()
      .single();

    if (error) {
      console.error("Reply feedback API hatası:", error);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }

    await updateInstructorActivity(supabaseAdmin, "test@test.com");

    return res.status(200).json({
      success: true,
      ok: true,
      feedback: data,
    });
  } catch (err) {
    console.error("Reply feedback genel hata:", err);
    return res.status(500).json({
      success: false,
      error: err.message || "Sunucu hatası",
    });
  }
}