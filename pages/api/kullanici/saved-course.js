import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  try {
    const { kullanici_id, course_id } = req.body || req.query;

    if (!kullanici_id || !course_id) {
      return res.status(400).json({
        ok: false,
        message: "Eksik veri",
      });
    }

    if (req.method === "GET") {
      const { data, error } = await supabaseAdmin
        .from("user_saved_courses")
        .select("*")
        .eq("kullanici_id", Number(kullanici_id));

      if (error) throw error;

      return res.status(200).json({
        ok: true,
        saved: data || [],
      });
    }

    if (req.method === "POST") {
      const { data: existing } = await supabaseAdmin
        .from("user_saved_courses")
        .select("*")
        .eq("kullanici_id", Number(kullanici_id))
        .eq("course_id", course_id)
        .maybeSingle();

      if (existing) {
        await supabaseAdmin
          .from("user_saved_courses")
          .delete()
          .eq("id", existing.id);

        return res.status(200).json({
          ok: true,
          saved: false,
        });
      }

      await supabaseAdmin.from("user_saved_courses").insert({
        kullanici_id: Number(kullanici_id),
        course_id,
      });

      return res.status(200).json({
        ok: true,
        saved: true,
      });
    }

    return res.status(405).json({ ok: false });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: error.message,
    });
  }
}