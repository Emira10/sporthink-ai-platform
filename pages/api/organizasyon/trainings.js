import { supabaseAdmin } from "../../../lib/supabaseAdmin";

function normalize(text = "") {
  return String(text)
    .toLowerCase()
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .trim();
}

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const { role = "kullanici" } = req.query;

      if (role === "kullanici") {
        const { kullanici_id } = req.query;

        if (!kullanici_id) {
          return res.status(400).json({
            ok: false,
            message: "kullanici_id gerekli",
          });
        }

        const { data: assignments, error: assignError } = await supabaseAdmin
          .from("training_assignments")
          .select("training_id")
          .eq("user_id", kullanici_id)
          .eq("is_active", true);

        if (assignError) throw assignError;

        const trainingIds = (assignments || [])
          .map((a) => a.training_id)
          .filter(Boolean);

        if (trainingIds.length === 0) {
          return res.status(200).json({
            ok: true,
            trainings: [],
          });
        }

        const { data: trainingsData, error: trainingsError } =
          await supabaseAdmin
            .from("trainings")
            .select("*")
            .in("id", trainingIds)
            .eq("status", "active")
            .order("created_at", { ascending: false });

        if (trainingsError) throw trainingsError;

        const { data: courseRows = [], error: courseError } =
          await supabaseAdmin.from("courses_data").select("id,title");

        if (courseError) throw courseError;

        const fixedTrainings = (trainingsData || []).map((t) => {
          const matchedCourse = courseRows.find(
            (c) => normalize(c.title) === normalize(t.training_title || t.title)
          );

          return {
            ...t,
            course_id: t.course_id || matchedCourse?.id || t.id,
          };
        });

        return res.status(200).json({
          ok: true,
          trainings: fixedTrainings,
        });
      }

      const { data, error } = await supabaseAdmin
        .from("department_trainings")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      return res.status(200).json({
        ok: true,
        trainings: data || [],
      });
    }

    if (req.method === "POST") {
      const {
        department_id,
        training_id,
        training_title,
        assigned_count,
        completed_count,
        type,
      } = req.body;

      if (!department_id) {
        return res.status(400).json({
          ok: false,
          message: "Departman seçilmelidir.",
        });
      }

      if (!training_title || !training_title.trim()) {
        return res.status(400).json({
          ok: false,
          message: "Eğitim adı zorunludur.",
        });
      }

      const { data, error } = await supabaseAdmin
        .from("department_trainings")
        .insert([
          {
            department_id,
            training_id: training_id || null,
            training_title: training_title.trim(),
            assigned_count: Number(assigned_count || 0),
            completed_count: Number(completed_count || 0),
            type: type || "Zorunlu",
          },
        ])
        .select("*")
        .single();

      if (error) throw error;

      return res.status(201).json({
        ok: true,
        training: data,
      });
    }

    return res.status(405).json({
      ok: false,
      message: "Method not allowed",
    });
  } catch (error) {
    console.error("Trainings API error:", error);
    return res.status(500).json({
      ok: false,
      message: error.message,
    });
  }
}