import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  try {
    const { id, status } = req.body;

    if (!id || !status) {
      return res.status(400).json({ ok: false, error: "Eksik veri" });
    }

    const { data, error } = await supabaseAdmin
      .from("user_certificates")
      .update({ status })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error(error);
      return res.status(500).json({ ok: false });
    }

    return res.json({ ok: true, certificate: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false });
  }
}