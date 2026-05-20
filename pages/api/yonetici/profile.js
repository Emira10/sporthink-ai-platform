import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({ ok: false, message: "Method not allowed" });
    }

    const { kullanici_id } = req.query;

    if (!kullanici_id) {
      return res.status(400).json({ ok: false, message: "kullanici_id gerekli" });
    }

    const { data: user, error } = await supabaseAdmin
      .from("kullanicilar")
      .select("kullanici_id, ad, soyad, e_posta, tur_id, departman, kayit_tarihi, created_at, updated_at, profil_foto_url, son_giris_tarihi")
      .eq("kullanici_id", Number(kullanici_id))
      .single();

    if (error) throw error;

    const { count: totalUsers } = await supabaseAdmin
      .from("kullanicilar")
      .select("*", { count: "exact", head: true });

    const { count: activeTrainings } = await supabaseAdmin
      .from("trainings")
      .select("*", { count: "exact", head: true });

    const { count: pendingAnnouncements } = await supabaseAdmin
      .from("duyurular")
      .select("*", { count: "exact", head: true });

    return res.status(200).json({
      ok: true,
      profile: {
        id: user.kullanici_id,
        name: `${user.ad || ""} ${user.soyad || ""}`.trim() || "Yönetici",
        email: user.e_posta || "-",
        role: Number(user.tur_id) === 3 ? "Yönetici / Admin" : "Yönetici",
        department: user.departman || "İnsan Kaynakları / Yönetim",
        joined: user.kayit_tarihi || user.created_at || null,
        updatedAt: user.updated_at || user.created_at || null,
        lastLogin: user.son_giris_tarihi || null,
        profilePhoto: user.profil_foto_url || null,
      },
      summary: {
        totalUsers: totalUsers || 0,
        activeTrainings: activeTrainings || 0,
        pendingAnnouncements: pendingAnnouncements || 0,
      },
      security: {
        authorityLevel: "Tam Yetkili",
        panelAccess: "Yönetici Paneli",
        systemStatus: "Aktif",
        lastLogin: user.son_giris_tarihi || null,
      },
    });
  } catch (error) {
    console.error("YONETICI PROFILE API ERROR:", error);
    return res.status(500).json({
      ok: false,
      message: error.message || "Yönetici profili alınamadı",
    });
  }
}