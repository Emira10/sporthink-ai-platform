import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({
      ok: false,
      message: "Sadece GET isteği desteklenir",
    });
  }

  try {
    const { data, error } = await supabaseAdmin
  .from("instructor_student_analysis")
  .select("*")
  .order("last_watched", { ascending: false })
  .limit(30);

    if (error) {
      console.error("Öğrenci analizi API hatası:", error);
      return res.status(500).json({
        ok: false,
        message: error.message,
      });
    }

    const rows = (data || []).map((row) => ({
      id: row.id,
      user_id: row.user_id,
      course_id: row.course_id,
      progress_percent: row.progress_percent || 0,
      is_completed: row.is_completed || false,
      last_watched: row.last_watched,

      profiles: {
        full_name: row.full_name || "Bilinmiyor",
        email: row.email || "-",
        department: row.department || "-",
      },

      courses_data: {
        title: row.course_title || "-",
        category: row.category || "-",
        type: row.type || "-",
      },
    }));

    return res.status(200).json({
      ok: true,
      count: rows.length,
      rows,
    });
  } catch (err) {
    console.error("Genel API hatası:", err);
    return res.status(500).json({
      ok: false,
      message: "Sunucu hatası",
    });
  }
}