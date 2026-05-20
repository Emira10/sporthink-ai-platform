import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  try {
    const { user_id } = req.query;

    const query = supabaseAdmin
      .from("user_activity_logs")
      .select("*")
      .order("created_at", {
        ascending: false,
      })
      .limit(15);

    if (user_id) {
      query.eq("user_id", user_id);
    }

    const { data, error } = await query;

    if (error) {
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      activities: data || [],
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
}