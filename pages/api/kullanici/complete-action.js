import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  }

  try {
    const { kullanici_id, mission_key } = req.body;

    if (!kullanici_id || !mission_key) {
      return res.status(400).json({
        success: false,
        message: "Eksik veri",
      });
    }

    const today = new Date().toISOString().slice(0, 10);

    // Görevi bul
    const { data: mission, error: missionError } = await supabaseAdmin
      .from("daily_missions")
      .select("*")
      .eq("mission_key", mission_key)
      .eq("is_active", true)
      .maybeSingle();

    if (missionError) {
      return res.status(500).json({
        success: false,
        message: missionError.message,
      });
    }

    if (!mission) {
      return res.status(404).json({
        success: false,
        message: "Görev bulunamadı",
      });
    }

    // Daha önce tamamlandı mı?
    const { data: existingMission } = await supabaseAdmin
      .from("user_daily_missions")
      .select("*")
      .eq("kullanici_id", kullanici_id)
      .eq("mission_id", mission.id)
      .eq("mission_date", today)
      .maybeSingle();

    if (existingMission?.is_completed) {
      return res.status(200).json({
        success: true,
        alreadyCompleted: true,
      });
    }

    // Görevi tamamla
    await supabaseAdmin
      .from("user_daily_missions")
      .upsert({
        kullanici_id,
        mission_id: mission.id,
        progress_count: 1,
        is_completed: true,
        mission_date: today,
        completed_at: new Date().toISOString(),
      });

    // Kullanıcı profilini çek
    const { data: profile } = await supabaseAdmin
      .from("user_learning_profile")
      .select("*")
      .eq("kullanici_id", kullanici_id)
      .maybeSingle();

    const currentXp = profile?.xp || 0;

    const rewardXp = mission.xp_reward || 50;

    const newXp = currentXp + rewardXp;

    const newLevel = Math.floor(newXp / 500) + 1;

    // XP güncelle
    await supabaseAdmin
      .from("user_learning_profile")
      .update({
        xp: newXp,
        level: newLevel,
        updated_at: new Date().toISOString(),
      })
      .eq("kullanici_id", kullanici_id);

      // Badge Kontrolü

const { data: allBadges } = await supabaseAdmin
  .from("badges")
  .select("*");

const { data: earnedBadges } = await supabaseAdmin
  .from("user_badges")
  .select("*")
  .eq("kullanici_id", kullanici_id);

const earnedIds = (earnedBadges || []).map((b) => b.badge_id);

for (const badge of allBadges || []) {
  let shouldUnlock = false;

  if (badge.badge_key === "first_step" && newXp >= 50) {
    shouldUnlock = true;
  }

  if (badge.badge_key === "half_way" && newXp >= 250) {
    shouldUnlock = true;
  }

  if (shouldUnlock && !earnedIds.includes(badge.id)) {
    await supabaseAdmin
      .from("user_badges")
      .insert({
        kullanici_id,
        badge_id: badge.id,
      });
  }
}

    return res.status(200).json({
  success: true,
  completed: true,
  xp: newXp,
  level: newLevel,
  rewardXp,
  mission_key,
});
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}