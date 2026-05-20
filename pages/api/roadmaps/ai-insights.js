import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  try {
    const { data: roadmaps = [], error } = await supabaseAdmin
      .from("roadmaps")
      .select(`
        *,
        roadmap_assignments(*)
      `);

    if (error) throw error;

    const insights = [];

    roadmaps.forEach((roadmap) => {
      const users = roadmap.roadmap_assignments || [];

      if (users.length === 0) return;

      const avg =
        users.reduce((s, u) => s + Number(u.progress || 0), 0) /
        users.length;

      if (avg < 40) {
        insights.push({
          type: "risk",
          text: `${roadmap.department} departmanı için ek gelişim desteği öneriliyor.`,
        });
      }

      if (avg >= 70) {
        insights.push({
          type: "success",
          text: `${roadmap.department} departmanı yüksek performans gösteriyor.`,
        });
      }

      const highRisk = users.filter((u) => u.risk === "Yüksek").length;

      if (highRisk >= 2) {
        insights.push({
          type: "warning",
          text: `${roadmap.title} yolunda riskli kullanıcı sayısı arttı.`,
        });
      }
    });

    return res.status(200).json({
      success: true,
      data: insights.slice(0, 6),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}