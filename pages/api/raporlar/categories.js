import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  try {
    const { user_id, period = "30g" } = req.query;

    const daysMap = { "7g": 6, "30g": 29, "3a": 89, yil: 364 };
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (daysMap[period] || 29));

    const { data, error } = await supabaseAdmin
      .from("user_activity_logs")
      .select("action_type, xp_earned, created_at")
      .eq("user_id", user_id)
      .gte("created_at", startDate.toISOString());

    if (error) throw error;

    const names = {
      quiz: "Quizler",
      analysis: "AI Analiz",
      communication: "İletişim",
      group_join: "Takım Çalışması",
    };

    const colors = ["#D85A30", "#1D9E75", "#378ADD", "#BA7517"];

    const total = data.length || 1;
    const grouped = {};

    (data || []).forEach((x) => {
      const key = x.action_type || "other";
      grouped[key] = (grouped[key] || 0) + 1;
    });

    const categories = Object.keys(grouped).map((key, i) => ({
      label: names[key] || "Diğer",
      pct: Math.round((grouped[key] / total) * 100),
      color: colors[i % colors.length],
    }));

    return res.status(200).json({ ok: true, categories });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
}