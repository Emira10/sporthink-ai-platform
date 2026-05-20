import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  try {
    const { data: userBadges, error } = await supabaseAdmin
      .from("user_badges")
      .select("*");

    if (error) throw error;

    const { data: points } = await supabaseAdmin
      .from("user_points")
      .select("*");

    const nameMap = {};
    (points || []).forEach((p) => {
      nameMap[String(p.user_id)] = p.student_name || "Kullanıcı";
    });

    const winnersMap = {};

    (userBadges || []).forEach((ub) => {
      const badgeId = ub.badge_id || ub.badge_key || ub.badge;

      if (!badgeId) return;

      if (!winnersMap[badgeId]) winnersMap[badgeId] = [];

      winnersMap[badgeId].push({
        name: nameMap[String(ub.user_id)] || ub.student_name || "Kullanıcı",
        unlocked_at: ub.unlocked_at || ub.created_at || null,
      });
    });

    return res.status(200).json({
      ok: true,
      winnersMap,
    });
  } catch (error) {
    console.error("BADGE WINNERS API ERROR:", error);
    return res.status(500).json({
      ok: false,
      message: error.message,
    });
  }
}