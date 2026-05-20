import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({ ok: false, error: "Method not allowed" });
    }

    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({ ok: false, error: "user_id gerekli" });
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 363);

    const { data, error } = await supabaseAdmin
      .from("user_activity_logs")
      .select("created_at, xp_earned")
      .eq("user_id", user_id)
      .gte("created_at", startDate.toISOString());

    if (error) throw error;

    const map = {};

    (data || []).forEach((a) => {
      const day = new Date(a.created_at).toISOString().slice(0, 10);
      if (!map[day]) map[day] = { count: 0, xp: 0 };
      map[day].count += 1;
      map[day].xp += Number(a.xp_earned || 0);
    });

    const days = Array.from({ length: 52 * 7 }, (_, i) => {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);

      const key = d.toISOString().slice(0, 10);
      const item = map[key] || { count: 0, xp: 0 };

      const level =
        item.xp >= 120 ? 4 :
        item.xp >= 80 ? 3 :
        item.xp >= 30 ? 2 :
        item.count > 0 ? 1 : 0;

      return {
        id: i,
        date: key,
        level,
        xp: item.xp,
        count: item.count,
      };
    });

    return res.status(200).json({
      ok: true,
      days,
    });
  } catch (err) {
    console.error("heatmap api error:", err);
    return res.status(500).json({
      ok: false,
      error: err.message,
    });
  }
}