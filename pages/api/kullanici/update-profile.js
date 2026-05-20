import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({
        ok: false,
        message: "Method not allowed",
      });
    }

    const { kullanici_id, name, email } = req.body;

    if (!kullanici_id) {
      return res.status(400).json({
        ok: false,
        message: "kullanici_id gerekli",
      });
    }

    const fullName = String(name || "").trim();
    const parts = fullName.split(" ");

    const ad = parts[0] || "Kullanıcı";
    const soyad = parts.slice(1).join(" ") || "";

    const { data, error } = await supabaseAdmin
      .from("kullanicilar")
      .update({
  ad,
  soyad,
  e_posta: email,
  updated_at: new Date().toISOString(),
})
      .eq("kullanici_id", Number(kullanici_id))
      .select()
      .single();

    if (error) {
      console.error(error);
      throw error;
    }

    return res.status(200).json({
      ok: true,
      profile: {
        id: data.kullanici_id,
        name: `${data.ad || ""} ${data.soyad || ""}`.trim(),
        email: data.e_posta || "-",
      },
    });
  } catch (error) {
    console.error("UPDATE PROFILE ERROR:", error);

    return res.status(500).json({
      ok: false,
      message: error.message || "Profil güncellenemedi",
    });
  }
}