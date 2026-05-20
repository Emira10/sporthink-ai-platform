import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  try {
    const { type } = req.query;

    if (!type) {
      return res.status(400).json({
        ok: false,
        message: "type gerekli",
      });
    }

    // ───────────────── USERS
    if (type === "users") {
      const { data, error } = await supabaseAdmin
        .from("kullanicilar")
        .select("kullanici_id, ad, soyad, e_posta")
        .limit(20);

      if (error) throw error;

      return res.status(200).json({
        ok: true,
        title: "Toplam Kullanıcı",
        items: data || [],
      });
    }

    // ───────────────── TRAININGS
    if (type === "trainings") {
      const { data, error } = await supabaseAdmin
        .from("trainings")
        .select("id, title, category, created_at")
        .limit(20);

      if (error) throw error;

      return res.status(200).json({
        ok: true,
        title: "Aktif Eğitim",
        items: data || [],
      });
    }

    // ───────────────── ANNOUNCEMENTS
    if (type === "pending") {
      const { data, error } = await supabaseAdmin
        .from("announcements")
        .select("id, title, created_at")
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;

      return res.status(200).json({
        ok: true,
        title: "Bekleyen İşlem",
        items: data || [],
      });
    }

    return res.status(400).json({
      ok: false,
      message: "Geçersiz type",
    });
  } catch (error) {
    console.error("SUMMARY DETAILS ERROR:", error);

    return res.status(500).json({
      ok: false,
      message: error.message,
    });
  }
}