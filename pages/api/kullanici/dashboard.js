import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  }

  try {
    const { kullanici_id } = req.query;

    if (!kullanici_id) {
      return res.status(400).json({
        success: false,
        message: "kullanici_id gerekli",
      });
    }

    const { data: profile, error } = await supabaseAdmin
      .from("user_learning_profile")
      .select("*")
      .eq("kullanici_id", kullanici_id)
      .maybeSingle();

    if (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      profile,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}