import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ success: false, error: "Method not allowed" });
    }

    const { user_id, student_name, points, source } = req.body;

    if (!user_id || !points) {
      return res.status(400).json({
        success: false,
        error: "user_id ve points gerekli",
      });
    }

    const { data, error } = await supabaseAdmin
      .from("user_points")
      .insert([
        {
          user_id,
          student_name: student_name || "Kullanıcı",
          points,
          source: source || "manual",
        },
      ])
      .select()
      .single();

    if (error) throw error;

    // TOTAL XP
const { data: allXP } = await supabaseAdmin
  .from("user_points")
  .select("points")
  .eq("user_id", user_id);

const totalXP = (allXP || []).reduce(
  (sum, item) => sum + Number(item.points || 0),
  0
);

// LEVEL SYSTEM
const level =
  totalXP >= 5000 ? 10 :
  totalXP >= 4000 ? 9 :
  totalXP >= 3000 ? 8 :
  totalXP >= 2200 ? 7 :
  totalXP >= 1600 ? 6 :
  totalXP >= 1100 ? 5 :
  totalXP >= 700  ? 4 :
  totalXP >= 400  ? 3 :
  totalXP >= 150  ? 2 : 1;

// AUTO BADGE
const { data: badges } = await supabaseAdmin
  .from("badges")
  .select("*")
  .lte("required_points", totalXP);

for (const badge of badges || []) {
  const { data: existing } = await supabaseAdmin
    .from("user_badges")
    .select("id")
    .eq("user_id", user_id)
    .eq("badge_id", badge.id)
    .maybeSingle();

  if (!existing) {
    await supabaseAdmin
      .from("user_badges")
      .insert({
        user_id,
        badge_id: badge.id,
      });
  }
}

// USER LEVEL UPDATE
await supabaseAdmin
  .from("profiles")
  .update({
    level,
    total_xp: totalXP,
  })
  .eq("id", user_id);

    // 🔔 XP NOTIFICATION
    await supabaseAdmin
      .from("user_notifications")
      .insert({
        user_id,
        title: "XP Kazandın",
        message: `${points} XP hesabına eklendi.`,
        type: "xp",
        is_read: false,
      });

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    console.error("add-points api error:", err);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
}