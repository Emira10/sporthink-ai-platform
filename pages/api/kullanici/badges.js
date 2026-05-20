import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({
      success: false,
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

    const { data: badges } = await supabaseAdmin
      .from("badges")
      .select("*")
      .eq("is_active", true)
      .order("id", { ascending: true });

    const { data: earned } = await supabaseAdmin
      .from("user_badges")
      .select("*")
      .eq("kullanici_id", kullanici_id);

    return res.status(200).json({
      success: true,
      badges: badges || [],
      earned: earned || [],
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}