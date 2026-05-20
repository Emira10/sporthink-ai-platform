import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ success: false, error: "Method not allowed" });
    }

    const { group_id, user_id, student_name } = req.body;

    if (!group_id || !user_id) {
      return res.status(400).json({
        success: false,
        error: "group_id ve user_id gerekli",
      });
    }

    const { data, error } = await supabaseAdmin
      .from("social_group_members")
      .insert({
        group_id,
        user_id,
        student_name: student_name || "Kullanıcı",
        joined_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return res.status(200).json({
          success: true,
          alreadyJoined: true,
          message: "Bu gruba daha önce katıldınız.",
        });
      }

      throw error;
    }

    await supabaseAdmin
  .from("user_activity_logs")
  .insert({
    user_id,
    student_name,

    action_type: "group_join",

    action_title: "Yeni Gruba Katıldı",

    action_desc: "Takım grubuna katılım sağlandı.",

    xp_earned: 15,
  });

    return res.status(200).json({
      success: true,
      alreadyJoined: false,
      message: "Gruba başarıyla katıldınız.",
      member: data,
    });
  } catch (err) {
    console.error("join-group api error:", err);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
}