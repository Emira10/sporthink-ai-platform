import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ ok: false, message: "Sadece GET desteklenir" });
  }

  const { data, error } = await supabaseAdmin
    .from("announcements")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return res.status(500).json({ ok: false, message: error.message });
  }

  return res.status(200).json({
    ok: true,
    rows: data || [],
  });
}