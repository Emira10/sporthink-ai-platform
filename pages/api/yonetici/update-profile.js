import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ ok: false, message: "Method not allowed" });
    }

    const { kullanici_id, name, email, department } = req.body;

    if (!kullanici_id) {
      return res.status(400).json({ ok: false, message: "kullanici_id gerekli" });
    }

    const parts = String(name || "").trim().split(" ");
    const ad = parts[0] || "Yönetici";
    const soyad = parts.slice(1).join(" ") || "";

    const { data, error } = await supabaseAdmin
      .from("kullanicilar")
      .update({
        ad,
        soyad,
        e_posta: email,
        departman: department || "İnsan Kaynakları / Yönetim",
        updated_at: new Date().toISOString(),
      })
      .eq("kullanici_id", Number(kullanici_id))
      .select("kullanici_id, ad, soyad, e_posta, departman, updated_at")
      .single();

    if (error) throw error;

    return res.status(200).json({
      ok: true,
      profile: {
        id: data.kullanici_id,
        name: `${data.ad || ""} ${data.soyad || ""}`.trim(),
        email: data.e_posta || "-",
        department: data.departman || "İnsan Kaynakları / Yönetim",
        updatedAt: data.updated_at,
      },
    });
  } catch (error) {
    console.error("YONETICI UPDATE PROFILE ERROR:", error);
    return res.status(500).json({
      ok: false,
      message: error.message || "Yönetici profili güncellenemedi",
    });
  }
}