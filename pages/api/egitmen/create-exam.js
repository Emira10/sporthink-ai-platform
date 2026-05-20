import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ ok: false, message: "Method not allowed" });
    }

    const { title, description, passing_score, duration_minutes } = req.body;

    if (!title) {
      return res.status(400).json({ ok: false, message: "Sınav başlığı gerekli." });
    }

    const { data, error } = await supabaseAdmin
      .from("final_exams")
      .insert({
        title,
        description: description || null,
        passing_score: Number(passing_score || 60),
        duration_minutes: Number(duration_minutes || 30),
        is_active: true,
        created_at: new Date().toISOString(),
      })
      .select("*")
      .single();

    if (error) throw error;

    await supabaseAdmin.from("activity_logs").insert({
      activity_type: "exam_created",
      user_name: "Eğitmen",
      activity_text: `${title} sınavı oluşturuldu`,
    });

    return res.status(200).json({ ok: true, exam: data });
  } catch (error) {
    return res.status(500).json({ ok: false, message: error.message });
  }
}