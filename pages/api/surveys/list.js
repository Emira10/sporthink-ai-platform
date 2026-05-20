import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  const { data, error } = await supabaseAdmin
    .from("training_surveys")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    return res.status(500).json({
      ok: false,
      error: error.message,
    });
  }

  return res.status(200).json({
    ok: true,
    surveys: data || [],
  });
}