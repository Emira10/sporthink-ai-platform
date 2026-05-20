import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false });
  }

  try {
    const { kullanici_id } = req.body;

    if (!kullanici_id) {
      return res.status(400).json({
        success: false,
        message: "kullanici_id gerekli",
      });
    }

    const { data, error } = await supabaseAdmin
      .from("user_learning_profile")
      .upsert(
        {
          kullanici_id,
          xp: 0,
          level: 1,
          mood: "Fena Değil",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "kullanici_id" }
      )
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      profile: data,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}