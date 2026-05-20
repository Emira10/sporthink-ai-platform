import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ ok: false });
    }

    const { user_id, training_id, due_date, is_active = true } = req.body;

const numericUserId = Number(user_id);

    if (!user_id || !training_id) {
      return res.status(400).json({
        ok: false,
        message: "Öğrenci ve eğitim seçilmelidir.",
      });
    }

    const { data, error } = await supabaseAdmin
      .from("training_assignments")
      .upsert(
  {
    user_id,
    kullanici_id: Number.isNaN(numericUserId) ? null : numericUserId,
    training_id,
    due_date: due_date || null,
    is_active,
    status: "assigned",
    assignment_type: "mandatory",
  },
  { onConflict: "user_id,training_id" }
)
      .select("*")
      .single();

    if (error) throw error;

    await supabaseAdmin
  .from("user_notifications")
  .insert({
    user_id,
    title: "Yeni Eğitim Atandı",
    message: "Yeni bir eğitim hesabına atandı.",
    type: "assignment",
  });

  const { data: student } = await supabaseAdmin
  .from("kullanicilar")
  .select("kullanici_id, ad, soyad, e_posta")
  .eq("kullanici_id", numericUserId)
  .maybeSingle();

const studentName = student
  ? `${student.ad || ""} ${student.soyad || ""}`.trim() || student.e_posta
  : "Öğrenci";

const { data: training } = await supabaseAdmin
  .from("courses_data")
  .select("title")
  .eq("id", training_id)
  .single();

await supabaseAdmin
  .from("activity_logs")
  .insert({
    activity_type: "assignment",
    user_name: studentName,
activity_text: `${studentName} adlı kullanıcıya ${
  training?.title || "bir eğitim"
} atandı`,
  });

    return res.status(200).json({
      ok: true,
      assignment: data,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: error.message,
    });
  }
}