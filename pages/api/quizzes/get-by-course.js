import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: "id gerekli" });
  }

  const { data, error } = await supabaseAdmin
    .from("ai_quizzes")
    .select("*")
    .eq("egitim_id", id)
    .order("created_at", { ascending: true });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json(data || []);
}