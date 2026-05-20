import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({
      success: false,
    });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("user_learning_profile")
      .select("kullanici_id, xp, level")
      .order("xp", { ascending: false })
      .limit(10);

    if (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      data: data || [],
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}