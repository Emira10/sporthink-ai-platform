import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  }

  try {
    const { data: announcements = [], error } = await supabaseAdmin
      .from("announcements")
      .select("id, views, clicks, reactions");

    if (error) throw error;

    const { data: reads = [], error: readError } = await supabaseAdmin
      .from("duyuru_interactions")
      .select("id")
      .eq("action", "read");

    if (readError) throw readError;

    const total = announcements.length;

    const views = announcements.reduce(
      (sum, item) => sum + Number(item.views || 0),
      0
    );

    const clicks = announcements.reduce(
      (sum, item) => sum + Number(item.clicks || 0),
      0
    );

    const reactions = announcements.reduce(
      (sum, item) => sum + Number(item.reactions || 0),
      0
    );

    const readCount = reads.length;

    const readRate =
      total > 0 ? Math.min(100, Math.round((readCount / total) * 100)) : 0;

    const clickRate =
      views > 0 ? Math.min(100, Math.round((clicks / views) * 100)) : 0;

    const interactionScore =
      views > 0
        ? Math.min(100, Math.round(((clicks + reactions) / views) * 100))
        : 0;

    const reachRate =
      total > 0 ? Math.min(100, Math.round((views / total) * 100)) : 0;

    return res.status(200).json({
      success: true,
      data: {
        total,
        views,
        clicks,
        reactions,
        readRate,
        clickRate,
        interactionScore,
        reachRate,
      },
    });
  } catch (error) {
    console.error("DUYURU STATS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "İstatistikler alınamadı",
    });
  }
}