import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, message: "Method not allowed" });
  }

  try {
    const { assignment_id, total_steps = 1 } = req.body;

    if (!assignment_id) {
      return res.status(400).json({ ok: false, message: "assignment_id gerekli" });
    }

    const { data: current, error: getError } = await supabaseAdmin
      .from("roadmap_assignments")
      .select("progress,status")
      .eq("id", assignment_id)
      .single();

    if (getError) throw getError;

    const stepValue = Math.ceil(100 / Number(total_steps || 1));
    const newProgress = Math.min(100, Number(current?.progress || 0) + stepValue);
    const newStatus = newProgress >= 100 ? "Tamamlandı" : "Devam Ediyor";

    const { data, error } = await supabaseAdmin
      .from("roadmap_assignments")
      .update({
        progress: newProgress,
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", assignment_id)
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json({ ok: true, data });
  } catch (error) {
    return res.status(500).json({ ok: false, message: error.message });
  }
}