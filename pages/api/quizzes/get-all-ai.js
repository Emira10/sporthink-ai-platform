import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  const { data, error } = await supabaseAdmin
    .from("ai_quizzes")
    .select("egitim_id, title, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return res.status(500).json({
      error: error.message,
    });
  }

  const unique = [
    ...new Map((data || []).map((item) => [item.egitim_id, item])).values(),
  ];

  return res.status(200).json(unique);
}