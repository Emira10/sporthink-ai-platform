import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  try {
    const { course_id } = req.query;

    if (!course_id) {
      return res.status(400).json({
        ok: false,
        message: "course_id gerekli",
      });
    }

    const { data, error } = await supabaseAdmin
      .from("course_lessons")
      .select("*")
      .eq("course_id", course_id)
      .order("lesson_order", { ascending: true });

    if (error) throw error;

    return res.status(200).json({
      ok: true,
      lessons: data || [],
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: error.message,
    });
  }
}