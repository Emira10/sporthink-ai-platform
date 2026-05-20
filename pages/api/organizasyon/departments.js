import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const { data, error } = await supabaseAdmin
        .from("departments")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      return res.status(200).json({
        ok: true,
        departments: data || [],
      });
    }

    if (req.method === "POST") {
      const { name, code, manager_name, description } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({
          ok: false,
          message: "Departman adı zorunludur.",
        });
      }

      const { data, error } = await supabaseAdmin
        .from("departments")
        .insert([
          {
            name: name.trim(),
            code: code?.trim() || null,
            manager_name: manager_name?.trim() || null,
            description: description?.trim() || null,
          },
        ])
        .select("*")
        .single();

      if (error) {
        console.error("Supabase insert error:", error);
        return res.status(500).json({
          ok: false,
          message: error.message,
        });
      }

      return res.status(201).json({
        ok: true,
        department: data,
      });
    }

    return res.status(405).json({
      ok: false,
      message: "Method not allowed",
    });
  } catch (error) {
    console.error("Departments API error:", error);
    return res.status(500).json({
      ok: false,
      message: error.message,
    });
  }
}