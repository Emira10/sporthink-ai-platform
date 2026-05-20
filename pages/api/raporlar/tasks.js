import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  try {
    const { user_id, period = "30g" } = req.query;

    if (!user_id) {
      return res.status(400).json({ ok: false, error: "user_id gerekli" });
    }

    const daysMap = { "7g": 6, "30g": 29, "3a": 89, yil: 364 };
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (daysMap[period] || 29));

    const { data, error } = await supabaseAdmin
      .from("user_activity_logs")
      .select("action_type, created_at")
      .eq("user_id", user_id)
      .gte("created_at", startDate.toISOString());

    if (error) throw error;

    const targets = {
      quiz: { name: "Quizler", target: 10, color: "#D85A30" },
      analysis: { name: "AI Analiz", target: 8, color: "#1D9E75" },
      communication: { name: "İletişim", target: 6, color: "#378ADD" },
      group_join: { name: "Takım Çalışması", target: 3, color: "#BA7517" },
    };

    const counts = {};

    (data || []).forEach((x) => {
      const key = x.action_type || "other";
      counts[key] = (counts[key] || 0) + 1;
    });

    const tasks = Object.keys(targets).map((key) => ({
      name: targets[key].name,
      val: Math.min(100, Math.round(((counts[key] || 0) / targets[key].target) * 100)),
      color: targets[key].color,
    }));

    return res.status(200).json({ ok: true, tasks });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
}