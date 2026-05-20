import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
    });
  }

  try {
    const {
      kullanici_id,
      mission_id,
      xp_reward = 50,
    } = req.body;

    if (!kullanici_id || !mission_id) {
      return res.status(400).json({
        success: false,
        message: "Eksik veri",
      });
    }
    const today = new Date().toISOString().slice(0, 10);

const { data: existingMission } = await supabaseAdmin
  .from("user_daily_missions")
  .select("*")
  .eq("kullanici_id", kullanici_id)
  .eq("mission_id", mission_id)
  .eq("mission_date", today)
  .maybeSingle();

if (existingMission?.is_completed) {
  return res.status(200).json({
    success: true,
    alreadyCompleted: true,
  });
}

    await supabaseAdmin
      .from("user_daily_missions")
      .upsert({
        kullanici_id,
        mission_id,
        progress_count: 1,
        is_completed: true,
        mission_date: today,
        completed_at: new Date().toISOString(),
      });

    const { data: profile } = await supabaseAdmin
      .from("user_learning_profile")
      .select("*")
      .eq("kullanici_id", kullanici_id)
      .single();

    const currentXp = profile?.xp || 0;

    const newXp = currentXp + xp_reward;

    const newLevel = Math.floor(newXp / 500) + 1;

    await supabaseAdmin
      .from("user_learning_profile")
      .update({
        xp: newXp,
        level: newLevel,
        updated_at: new Date().toISOString(),
      })
      .eq("kullanici_id", kullanici_id);

    return res.status(200).json({
      success: true,
      xp: newXp,
      level: newLevel,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}