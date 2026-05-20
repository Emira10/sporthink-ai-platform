import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false });
  }

  try {
    const { title, department, level, status, risk, ai_note, steps = [] } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Başlık gerekli",
      });
    }

    const { data: roadmap, error } = await supabaseAdmin
      .from("roadmaps")
      .insert({
        title,
        department: department || "Genel",
        level: level || "Başlangıç",
        status: status || "Aktif",
        risk: risk || "Düşük",
        ai_note: ai_note || "",
      })
      .select()
      .single();

    if (error) throw error;

    if (steps.length > 0) {
      
      const rows = steps.map((step, index) => ({
  roadmap_id: roadmap.id,
  title: step.title,
  step_order: index + 1,
  step_type: step.step_type || "training",
  target_id: step.target_id,
  target_table: step.target_table,
  training_id: step.target_id,
  auto_track: true,
}));

      const { error: stepError } = await supabaseAdmin
        .from("roadmap_steps")
        .insert(rows);

      if (stepError) throw stepError;
    }

    return res.status(201).json({
      success: true,
      data: roadmap,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}