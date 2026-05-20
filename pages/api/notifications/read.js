import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  try {
    const { id } = req.body;

    await supabaseAdmin
      .from("user_notifications")
      .update({ is_read: true })
      .eq("id", id);

    return res.status(200).json({ ok: true });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: error.message,
    });
  }
}