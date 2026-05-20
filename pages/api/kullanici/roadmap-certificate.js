import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ ok: false });

  try {
    const { kullanici_id, roadmap_id, roadmap_title } = req.body;

    if (!kullanici_id || !roadmap_id) {
      return res.status(400).json({ ok: false, message: "Eksik veri" });
    }

    const { data: steps = [], error: stepError } = await supabaseAdmin
      .from("roadmap_steps")
      .select("target_id, step_type, title")
      .eq("roadmap_id", roadmap_id);

    if (stepError) throw stepError;

    const learningSteps = steps.filter(
      (s) => String(s.step_type || "training") !== "certificate"
    );

    const targetIds = learningSteps
      .map((s) => String(s.target_id || ""))
      .filter(Boolean);

    const { data: progressRows = [], error: progressError } = await supabaseAdmin
      .from("user_progress")
      .select("course_id,status,progress_percent")
      .eq("kullanici_id", Number(kullanici_id))
      .in("course_id", targetIds);

    if (progressError) throw progressError;

    const completedIds = new Set(
      progressRows
        .filter((p) => p.status === "completed" || Number(p.progress_percent || 0) >= 100)
        .map((p) => String(p.course_id))
    );

    const allDone =
      targetIds.length > 0 && targetIds.every((id) => completedIds.has(String(id)));

    if (!allDone) {
      return res.status(403).json({
        ok: false,
        message: "Sertifika için tüm yol haritası tamamlanmalıdır.",
      });
    }

    const { data, error } = await supabaseAdmin
      .from("user_certificates")
      .upsert(
        {
          user_id: String(kullanici_id),
          template_key: `roadmap_${roadmap_id}`,
          training_id: String(roadmap_id),
          training_name: roadmap_title || "Yol Haritası",
          level: "ROADMAP UZMANLIK SERTİFİKASI",
          score: "100/100",
          status: "unlocked",
          issued_at: new Date().toISOString(),
        },
        { onConflict: "user_id,template_key" }
      )
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json({ ok: true, certificate: data });
  } catch (error) {
    return res.status(500).json({ ok: false, message: error.message });
  }
}