import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import templates from "../../../utils/templates";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    const {
      user_id,
      template_key,
      training_id,
      training_name,
      level,
      score,
    } = req.body;

    if (!user_id || !template_key) {
      return res.status(400).json({
        ok: false,
        error: "user_id ve template_key zorunludur",
      });
    }

    const template = templates[template_key];

    const { data, error } = await supabaseAdmin
      .from("user_certificates")
      .upsert(
        {
          user_id: String(user_id),
          template_key,
          training_id: training_id ? String(training_id) : null,
          training_name: training_name || "Eğitim",

          level: level || template?.defaultLevel || "ALTIN SEVİYE",
          score: score || template?.defaultScore || "92/100",

          status: "unlocked",
          issued_at: new Date().toISOString(),
        },
        { onConflict: "user_id,template_key" }
      )
      .select()
      .single();

    if (error) {
      return res.status(500).json({ ok: false, error: error.message });
    }

    // 🔔 CERTIFICATE NOTIFICATION
    await supabaseAdmin
      .from("user_notifications")
      .insert({
        user_id: Number(user_id),
        title: "Sertifika Hazır",
        message: `${training_name || "Eğitim"} sertifikan oluşturuldu.`,
        type: "certificate",
        is_read: false,
      });

    return res.status(200).json({ ok: true, certificate: data });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
}