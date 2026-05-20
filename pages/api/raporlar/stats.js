import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  try {
    const { user_id, period = "30g" } = req.query;
    if (!user_id) return res.status(400).json({ ok: false, error: "user_id gerekli" });

    const startDate = new Date();

const daysMap = {
  "7g": 6,
  "30g": 29,
  "3a": 89,
  "yil": 364,
};

startDate.setDate(startDate.getDate() - (daysMap[period] || 29));

    const { data: logs = [], error } = await supabaseAdmin
      .from("user_activity_logs")
      .select("created_at, xp_earned, action_type")
      .eq("user_id", user_id)
      .gte("created_at", startDate.toISOString());

    if (error) throw error;

    const { data: leaderboard = [] } = await supabaseAdmin
      .from("leaderboard_view")
      .select("*")
      .order("points", { ascending: false });

    const meIndex = leaderboard.findIndex((u) => u.user_id === user_id);
    const myRank = meIndex >= 0 ? `#${meIndex + 1}` : "—";

    const totalXP = logs.reduce((s, a) => s + Number(a.xp_earned || 0), 0);
    const completedTasks = logs.length;

    const uniqueDays = [...new Set(logs.map((a) =>
      new Date(a.created_at).toISOString().slice(0, 10)
    ))];

    const streak = uniqueDays.length;

    const badges = Math.floor(totalXP / 500);

    const labels = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
    const weeklyXP = [0, 0, 0, 0, 0, 0, 0];

    logs.forEach((a) => {
      const day = new Date(a.created_at).getDay();
      const index = day === 0 ? 6 : day - 1;
      weeklyXP[index] += Number(a.xp_earned || 0);
    });

    return res.status(200).json({
      ok: true,
      stats: {
        xp: totalXP,
        gorev: completedTasks,
        rozet: badges,
        tamamlama: Math.min(100, completedTasks * 10),
        streak,
        rank: myRank,
        labels,
        xpData: weeklyXP,
        insight:
  totalXP > 2500
    ? "AI Analizi: Bu dönem olağanüstü bir performans gösterdin. Öğrenme aktiviten platform ortalamasının üzerinde ilerliyor."
    : completedTasks < 5
    ? "AI Analizi: Aktivite yoğunluğun düşük görünüyor. Daha fazla görev tamamlayarak gelişim hızını artırabilirsin."
    : streak >= 7
    ? "AI Analizi: Düzenli öğrenme serin dikkat çekiyor. Sistem seni yüksek motivasyonlu kullanıcı olarak algılıyor."
    : "AI Analizi: Öğrenme performansın dengeli ilerliyor. Quiz ve analiz görevlerine ağırlık vermen önerilir.",
      },
    });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
}