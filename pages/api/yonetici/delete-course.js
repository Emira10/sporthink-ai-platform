import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ error: "ID zorunlu" });
    }

    await supabaseAdmin
      .from("ai_quizzes")
      .delete()
      .eq("egitim_id", id);

    const { data, error } = await supabaseAdmin
      .from("yonetici_egitimler")
      .delete()
      .eq("id", id)
      .select();

    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(404).json({ error: "Kurs bulunamadı." });
    }

    return res.status(200).json({ ok: true, deleted: data });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}