import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  try {
    const { search } = req.query;

    let query = supabaseAdmin
      .from("user_certificates")
      .select("*")
      .order("issued_at", { ascending: false });

    if (search) {
      query = query.or(
        `training_name.ilike.%${search}%,level.ilike.%${search}%,user_id.ilike.%${search}%`
      );
    }

    const { data, error } = await query;

    if (error) {
      console.error(error);
      return res.status(500).json({ ok: false });
    }

    return res.status(200).json({
      ok: true,
      certificates: data,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false });
  }
}