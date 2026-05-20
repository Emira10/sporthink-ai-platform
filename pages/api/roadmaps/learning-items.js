import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  try {
    const { data: coursesData, error: coursesError } = await supabaseAdmin
      .from("courses_data")
      .select("id,title,category,content_type,video_url,file_url")
      .order("created_at", { ascending: false });

    if (coursesError) throw coursesError;

    const { data: trainingsData, error: trainingsError } = await supabaseAdmin
      .from("trainings")
      .select("id,title,category,content_type,video_url,file_url")
      .order("created_at", { ascending: false });

    if (trainingsError) throw trainingsError;

    const courses = Array.isArray(coursesData) ? coursesData : [];
    const trainings = Array.isArray(trainingsData) ? trainingsData : [];

    const items = [
      ...courses.map((x) => ({
        id: String(x.id),
        title: x.title || "İsimsiz Eğitim",
        source: "courses_data",
        type: x.content_type || "course",
        category: x.category || "Genel",
      })),

      ...trainings.map((x) => ({
        id: String(x.id),
        title: x.title || "İsimsiz Eğitim",
        source: "trainings",
        type: x.content_type || "training",
        category: x.category || "Genel",
      })),
    ];

    return res.status(200).json({
      success: true,
      items,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}