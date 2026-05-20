import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const { data: users, error } = await supabaseAdmin
        .from("kullanicilar")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      return res.status(200).json({ ok: true, users: users || [] });
    }

    if (req.method === "POST") {
      const payload = req.body;

      const { data, error } = await supabaseAdmin
        .from("kullanicilar")
        .insert(payload)
        .select()
        .single();

      if (error) throw error;

      return res.status(200).json({ ok: true, user: data });
    }

    if (req.method === "PUT") {
      const { kullanici_id, ...payload } = req.body;

      const { data, error } = await supabaseAdmin
        .from("kullanicilar")
        .update(payload)
        .eq("kullanici_id", kullanici_id)
        .select()
        .single();

      if (error) throw error;

      return res.status(200).json({ ok: true, user: data });
    }

    if (req.method === "DELETE") {
      const { kullanici_id } = req.body;

      const { error } = await supabaseAdmin
        .from("kullanicilar")
        .delete()
        .eq("kullanici_id", kullanici_id);

      if (error) throw error;

      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ ok: false, message: "Method not allowed" });
  } catch (err) {
    return res.status(500).json({ ok: false, message: err.message });
  }
}