import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({
        ok: false,
        message: "Method not allowed",
      });
    }

    const { data: departments, error: depError } = await supabaseAdmin
      .from("departments")
      .select("*")
      .order("created_at", { ascending: false });

    if (depError) throw depError;

    const { data: members, error: memError } = await supabaseAdmin
      .from("department_members")
      .select("*")
      .order("created_at", { ascending: false });

    if (memError) throw memError;

    const { data: trainings, error: trainError } = await supabaseAdmin
      .from("department_trainings")
      .select("*")
      .order("created_at", { ascending: false });

    if (trainError) throw trainError;

    const totalMembers = members?.length || 0;
    const totalDepartments = departments?.length || 0;
    const totalTrainings = trainings?.length || 0;

    const avgCompletion =
      trainings && trainings.length > 0
        ? Math.round(
            trainings.reduce((sum, item) => {
              const assigned = Number(item.assigned_count || 0);
              const completed = Number(item.completed_count || 0);
              const rate = assigned > 0 ? (completed / assigned) * 100 : 0;
              return sum + rate;
            }, 0) / trainings.length
          )
        : 0;

    return res.status(200).json({
      ok: true,
      departments: departments || [],
      members: members || [],
      trainings: trainings || [],
      stats: {
        totalMembers,
        totalDepartments,
        totalTrainings,
        avgCompletion,
      },
    });
  } catch (error) {
    console.error("Organizasyon overview error:", error);
    return res.status(500).json({
      ok: false,
      message: error.message,
    });
  }
}