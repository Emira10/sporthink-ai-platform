import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ ok: false, message: "Method not allowed" });
    }

    const { kullanici_id, profil_foto_url } = req.body;

    if (!kullanici_id) {
      return res.status(400).json({
        ok: false,
        message: "kullanici_id ve profil_foto_url gerekli",
      });
    }

    const { error } = await supabaseAdmin
      .from("kullanicilar")
      .update({ profil_foto_url })
      .eq("kullanici_id", Number(kullanici_id));

    if (error) throw error;

    return res.status(200).json({
      ok: true,
      profil_foto_url,
    });
  } catch (error) {
    console.error("UPDATE PROFILE PHOTO ERROR:", error);
    return res.status(500).json({
      ok: false,
      message: error.message,
    });
  }
}