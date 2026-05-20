import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const { user_id } = req.query;

      if (!user_id) {
        return res.status(400).json({ error: "user_id gerekli" });
      }

      const { data, error } = await supabaseAdmin
        .from("user_missions")
        .select("*")
        .eq("user_id", user_id)
        .eq("mission_key", "oyunlastirma_main")
        .maybeSingle();

      if (error) throw error;

      return res.status(200).json({
        success: true,
        progress: data || null,
      });
    }

    if (req.method === "POST") {
      const { user_id, current_step, completed_steps, completed } = req.body;

      if (!user_id) {
        return res.status(400).json({ error: "user_id gerekli" });
      }

      const { data, error } = await supabaseAdmin
        .from("user_missions")
        .upsert(
          {
            user_id,
            mission_key: "oyunlastirma_main",
            current_step: current_step || 1,
            completed_steps: completed_steps || [],
            completed: completed || false,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "user_id,mission_key",
          }
        )
        .select()
        .single();

      if (error) throw error;

      return res.status(200).json({
        success: true,
        progress: data,
      });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("mission-progress api error:", err);
    return res.status(500).json({ error: err.message });
  }
}