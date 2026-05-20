import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ ok: false, message: "Method not allowed" });
    }

    const { kullanici_id, training_id } = req.body;

    if (!kullanici_id || !training_id) {
      return res.status(400).json({ ok: false, message: "Eksik veri" });
    }

    const { data, error } = await supabaseAdmin
      .from("training_progress")
      .upsert(
        {
          kullanici_id: Number(kullanici_id),
          training_id,
          progress: 1,
          status: "started",
          started_at: new Date().toISOString(),
        },
        { onConflict: "kullanici_id,training_id" }
      )
      .select("*")
      .single();

    if (error) throw error;

    return res.status(200).json({ ok: true, progress: data });
  } catch (error) {
    return res.status(500).json({ ok: false, message: error.message });
  }
}