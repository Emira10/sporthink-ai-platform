import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ ok: false });
    }

    const {
      user_id,
      title,
      message,
      type = "general",
    } = req.body;

    const { data, error } = await supabaseAdmin
      .from("user_notifications")
      .insert({
        user_id,
        title,
        message,
        type,
      })
      .select("*")
      .single();

    if (error) throw error;

    return res.status(200).json({
      ok: true,
      notification: data,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: error.message,
    });
  }
}