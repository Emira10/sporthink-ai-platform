import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  const { id } = req.body;

  const { error } = await supabaseAdmin
    .from("user_certificates")
    .delete()
    .eq("id", id);

  if (error) {
    return res.status(500).json({ ok: false });
  }

  return res.json({ ok: true });
}