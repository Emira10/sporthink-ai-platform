import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  try {
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({
        ok: false,
        message: "user_id gerekli",
      });
    }

    const { data: progress } = await supabaseAdmin
      .from("user_progress")
      .select("*")
      .eq("user_id", user_id);

    const completed = (progress || []).filter(
      (p) => p.status === "completed"
    ).length;

    const totalCourses = progress?.length || 0;

    const totalLearningMinutes = (progress || []).reduce(
      (sum, p) => sum + (p.learning_minutes || 0),
      0
    );

    const averageProgress =
      totalCourses > 0
        ? Math.floor(
            (progress || []).reduce(
              (sum, p) => sum + (p.progress_percent || 0),
              0
            ) / totalCourses
          )
        : 0;

    const { data: savedCourses } = await supabaseAdmin
      .from("user_saved_courses")
      .select("*")
      .eq("user_id", user_id);

    const { data: notes } = await supabaseAdmin
      .from("user_course_notes")
      .select("*")
      .eq("user_id", user_id);

    return res.status(200).json({
      ok: true,

      analytics: {
        totalCourses,
        completedCourses: completed,
        totalLearningMinutes,
        averageProgress,
        savedCourses: savedCourses?.length || 0,
        notesCount: notes?.length || 0,
      },
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: error.message,
    });
  }
}