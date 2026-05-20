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

    const { data: student } = await supabaseAdmin
      .from("kullanicilar")
      .select("ad, soyad, e_posta")
      .eq("kullanici_id", Number(kullanici_id))
      .maybeSingle();

    const { data: training } = await supabaseAdmin
      .from("courses_data")
      .select("title")
      .eq("id", training_id)
      .maybeSingle();

    const studentName = student
      ? `${student.ad || ""} ${student.soyad || ""}`.trim() || student.e_posta
      : "Öğrenci";

    const { data, error } = await supabaseAdmin
      .from("training_progress")
      .upsert(
        {
          kullanici_id: Number(kullanici_id),
          training_id,
          progress: 100,
          status: "completed",
          completed_at: new Date().toISOString(),
        },
        { onConflict: "kullanici_id,training_id" }
      )
      .select("*")
      .single();

    if (error) throw error;

    await supabaseAdmin.from("training_assignments").update({
      status: "completed",
      progress: 100,
      completed_at: new Date().toISOString(),
    })
    .eq("kullanici_id", Number(kullanici_id))
    .eq("training_id", training_id);

    await supabaseAdmin.from("activity_logs").insert({
      activity_type: "completion",
      user_name: studentName,
      activity_text: `${studentName} ${training?.title || "bir eğitimi"} başarıyla tamamladı`,
    });

    return res.status(200).json({ ok: true, progress: data });
  } catch (error) {
    return res.status(500).json({ ok: false, message: error.message });
  }
}