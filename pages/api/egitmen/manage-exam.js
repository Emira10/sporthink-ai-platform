import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  try {
    const { exam_id, title, description, passing_score, duration_minutes, is_active } = req.body;

    if (!exam_id) {
      return res.status(400).json({ ok: false, message: "exam_id gerekli" });
    }

    if (req.method === "PATCH") {
      const updates = { updated_at: new Date().toISOString() };

      if (title !== undefined) updates.title = title;
      if (description !== undefined) updates.description = description;
      if (passing_score !== undefined) updates.passing_score = Number(passing_score);
      if (duration_minutes !== undefined) updates.duration_minutes = Number(duration_minutes);
      if (is_active !== undefined) updates.is_active = is_active;

      const { data, error } = await supabaseAdmin
        .from("final_exams")
        .update(updates)
        .eq("id", exam_id)
        .select("*")
        .single();

      if (error) throw error;

      await supabaseAdmin.from("activity_logs").insert({
        activity_type: "exam_updated",
        user_name: "Eğitmen",
        activity_text: `${data.title} sınavı güncellendi`,
      });

      return res.status(200).json({ ok: true, exam: data });
    }

    if (req.method === "DELETE") {
      const { data: exam } = await supabaseAdmin
        .from("final_exams")
        .select("title")
        .eq("id", exam_id)
        .single();

      const { error } = await supabaseAdmin
        .from("final_exams")
        .delete()
        .eq("id", exam_id);

      if (error) throw error;

      await supabaseAdmin.from("activity_logs").insert({
        activity_type: "exam_deleted",
        user_name: "Eğitmen",
        activity_text: `${exam?.title || "Bir sınav"} silindi`,
      });

      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ ok: false, message: "Method not allowed" });
  } catch (error) {
    return res.status(500).json({ ok: false, message: error.message });
  }
}