import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  try {
    const { user_id } = req.query;

    const { data, error } = await supabaseAdmin
      .from("user_notifications")
      .select("*")
      .eq("user_id", Number(user_id))
      .order("created_at", { ascending: false });

    if (error) throw error;

    return res.status(200).json({
      ok: true,
      notifications: data || [],
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: error.message,
    });
  }
}