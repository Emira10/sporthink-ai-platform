import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({ success: false, error: "Method not allowed" });
    }

    const { data, error } = await supabaseAdmin
      .from("social_group_members")
      .select("id");

    if (error) throw error;

    const activeCount = data?.length || 0;
    const requiredCount = 5;

    return res.status(200).json({
      success: true,
      activeCount,
      requiredCount,
      preparationRate: Math.min(100, Math.round((activeCount / requiredCount) * 100)),
      teamStatus: activeCount >= requiredCount ? "Takım göreve hazır" : "Takım yapılanıyor",
      unlocked: activeCount >= requiredCount,
    });
  } catch (err) {
    console.error("cooperation-status error:", err);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
}