import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const { data, error } = await supabaseAdmin
        .from("activity_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;

      return res.status(200).json({ ok: true, logs: data || [] });
    }

    if (req.method === "POST") {
      const { actor_name, action, target_type, target_id } = req.body;

      const { data, error } = await supabaseAdmin
        .from("activity_logs")
        .insert({
          actor_name: actor_name || "Sistem",
          action,
          target_type: target_type || "user",
          target_id: target_id || null,
        })
        .select()
        .single();

      if (error) throw error;

      return res.status(200).json({ ok: true, log: data });
    }

    return res.status(405).json({ ok: false, message: "Method not allowed" });
  } catch (err) {
    return res.status(500).json({ ok: false, message: err.message });
  }
}