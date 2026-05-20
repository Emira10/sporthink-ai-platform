import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    const { roadmap_id, users = [] } = req.body;

    if (!roadmap_id || users.length === 0) {
      return res.status(400).json({
        success: false,
        message: "roadmap_id ve users gerekli",
      });
    }

    const rows = users.map((u) => ({
      roadmap_id,
      user_id: u.user_id,
      user_name: u.user_name,
      department: u.department || "Genel",
      progress: 0,
      status: "Devam Ediyor",
      risk: "Düşük",
    }));

    const { data, error } = await supabaseAdmin
      .from("roadmap_assignments")
      .insert(rows)
      .select();

    if (error) throw error;

    return res.status(201).json({
      success: true,
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}