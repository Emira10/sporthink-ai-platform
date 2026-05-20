import { supabaseAdmin } from "../../../lib/supabaseAdmin";

function getStoragePathFromUrl(url) {
  if (!url) return null;

  const markers = [
    "/storage/v1/object/public/training-files/",
    "/storage/v1/object/public/egitim-dosyalar/",
  ];

  for (const marker of markers) {
    const index = url.indexOf(marker);

    if (index !== -1) {
      return decodeURIComponent(url.slice(index + marker.length));
    }
  }

  return null;
}

export default async function handler(req, res) {
  try {
    if (req.method !== "DELETE") {
      return res.status(405).json({
        ok: false,
        message: "Method not allowed",
      });
    }

    const { course_id } = req.body;

    if (!course_id) {
      return res.status(400).json({
        ok: false,
        message: "course_id gerekli",
      });
    }

    const { data: course, error: fetchError } = await supabaseAdmin
      .from("courses_data")
      .select("*")
      .eq("id", course_id)
      .single();

    if (fetchError || !course) {
      return res.status(404).json({
        ok: false,
        message: "Kurs bulunamadı",
      });
    }

    // ─────────────────────────────
    // STORAGE DELETE
    // ─────────────────────────────

    const filePaths = [
      getStoragePathFromUrl(course.file_url),
      getStoragePathFromUrl(course.video_url),
      getStoragePathFromUrl(course.cover_url),
    ].filter(Boolean);

    if (filePaths.length > 0) {
      await supabaseAdmin.storage
        .from("training-files")
        .remove(filePaths);

      await supabaseAdmin.storage
        .from("egitim-dosyalar")
        .remove(filePaths);
    }

    // ─────────────────────────────
    // LESSONS DELETE
    // ─────────────────────────────

    await supabaseAdmin
      .from("course_lessons")
      .delete()
      .eq("course_id", course_id);

    // ─────────────────────────────
    // RELATED TABLES
    // ─────────────────────────────

    await supabaseAdmin
      .from("training_assignments")
      .delete()
      .eq("training_id", course_id);

    await supabaseAdmin
      .from("training_progress")
      .delete()
      .eq("training_id", course_id);

    await supabaseAdmin
      .from("user_progress")
      .delete()
      .eq("course_id", course_id);

    // ─────────────────────────────
    // COURSE DELETE
    // ─────────────────────────────

    const { error } = await supabaseAdmin
      .from("courses_data")
      .delete()
      .eq("id", course_id);

    if (error) throw error;

    // ─────────────────────────────
    // ACTIVITY LOG
    // ─────────────────────────────

    await supabaseAdmin.from("activity_logs").insert({
      activity_type: "course_deleted",
      user_name: "Eğitmen",
      activity_text: `${course.title || "Bir eğitim"} sistemden silindi`,
    });

    return res.status(200).json({
      ok: true,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: error.message,
    });
  }
}