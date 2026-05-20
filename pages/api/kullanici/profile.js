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

    const { data: user, error: userError } = await supabaseAdmin
      .from("kullanicilar")
      .select("kullanici_id, ad, soyad, e_posta, tur_id, kayit_tarihi, created_at, updated_at, profil_foto_url")
      .eq("kullanici_id", Number(kullanici_id))
      .single();

    if (userError) throw userError;

    const { data: learningProfile } = await supabaseAdmin
      .from("user_learning_profile")
      .select("level, xp")
      .eq("kullanici_id", Number(kullanici_id))
      .maybeSingle();

    return res.status(200).json({
      ok: true,
      profile: {
        id: user.kullanici_id,
        name: `${user.ad || ""} ${user.soyad || ""}`.trim() || "Kullanıcı",
        email: user.e_posta || "-",
        department: "Genel",
        role: Number(user.tur_id) === 1 ? "Öğrenci" : "Kullanıcı",
        joined: user.kayit_tarihi || user.created_at || null,
        updatedAt: user.updated_at || user.created_at || null,
        level: learningProfile?.level || 1,
        xp: learningProfile?.xp || 0,
        profilePhoto: user.profil_foto_url || null,
      },
    });
  } catch (error) {
    console.error("PROFILE API ERROR:", error);

    return res.status(500).json({
      ok: false,
      message: error.message || "Profil bilgileri alınamadı",
    });
  }
}