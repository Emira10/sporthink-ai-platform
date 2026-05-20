import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  const { id, note } = req.body;

  const { data, error } = await supabaseAdmin
    .from("user_certificates")
    .update({ note })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return res.status(500).json({ ok: false });
  }

  return res.json({ ok: true, certificate: data });
}