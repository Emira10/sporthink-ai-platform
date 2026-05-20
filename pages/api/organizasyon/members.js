import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const { data, error } = await supabaseAdmin
        .from("department_members")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      return res.status(200).json({
        ok: true,
        members: data || [],
      });
    }

    if (req.method === "POST") {
      const {
        department_id,
        user_id,
        user_name,
        user_email,
        role,
        status,
        progress,
      } = req.body;

      if (!department_id) {
        return res.status(400).json({
          ok: false,
          message: "Departman seçilmelidir.",
        });
      }

      if (!user_name || !user_name.trim()) {
        return res.status(400).json({
          ok: false,
          message: "Çalışan adı zorunludur.",
        });
      }

      const { data, error } = await supabaseAdmin
        .from("department_members")
        .insert([
          {
            department_id,
            user_id: user_id || null,
            user_name: user_name.trim(),
            user_email: user_email?.trim() || null,
            role: role || "Çalışan",
            status: status || "Aktif",
            progress: Number(progress || 0),
          },
        ])
        .select("*")
        .single();

      if (error) throw error;

      return res.status(201).json({
        ok: true,
        member: data,
      });
    }

    return res.status(405).json({
      ok: false,
      message: "Method not allowed",
    });
  } catch (error) {
    console.error("Members API error:", error);
    return res.status(500).json({
      ok: false,
      message: error.message,
    });
  }
}