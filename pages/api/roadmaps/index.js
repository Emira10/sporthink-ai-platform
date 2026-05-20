import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false });
  }

  try {
    const { data: roadmaps = [], error } = await supabaseAdmin
      .from("roadmaps")
      .select(`
        *,
        roadmap_steps(*),
        roadmap_assignments(*)
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const formatted = roadmaps.map((r) => {
      const assignments = r.roadmap_assignments || [];
      const avgProgress = assignments.length
        ? Math.round(assignments.reduce((s, a) => s + Number(a.progress || 0), 0) / assignments.length)
        : 0;

      return {
        id: r.id,
        title: r.title,
        department: r.department,
        level: r.level,
        status: r.status,
        risk: r.risk,
        aiNote: r.ai_note,
        progress: avgProgress,
        users: assignments.length,
        assignments: assignments,
        steps: (r.roadmap_steps || [])
          .sort((a, b) => a.step_order - b.step_order)
          .map((s, index) => ({
            title: s.title,
            done: index < Math.floor(avgProgress / 25),
            active: index === Math.floor(avgProgress / 25),
            locked: index > Math.floor(avgProgress / 25),
          })),
      };
    });

    return res.status(200).json({
      success: true,
      data: formatted,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}