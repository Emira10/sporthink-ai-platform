import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  try {
    const { kullanici_id } = req.query;

    if (!kullanici_id) {
      return res.status(400).json({
        ok: false,
        message: "kullanici_id gerekli",
      });
    }

    const { data } = await supabaseAdmin
      .from("quiz_results")
      .select("*")
      .eq("kullanici_id", Number(kullanici_id));

    if (!data || data.length === 0) {
      return res.status(200).json({
        ok: true,
        insight:
          "Henüz sınav verisi bulunamadı. İlk sınavını tamamlayarak kişisel analizini başlatabilirsin.",
      });
    }

    const avg =
      data.reduce((a, b) => a + (b.score || 0), 0) / data.length;

    let insight = "";

    if (avg >= 85) {
      insight =
        "Harika performans! Platform ortalamasının oldukça üzerindesin.";
    } else if (avg >= 70) {
      insight =
        "İyi gidiyorsun. Düzenli tekrar ile başarı seviyeni yükseltebilirsin.";
    } else {
      insight =
        "Gelişim alanların bulunuyor. Eğitim içeriklerini tekrar incelemen önerilir.";
    }

    return res.status(200).json({
      ok: true,
      avg,
      insight,
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: err.message,
    });
  }
}