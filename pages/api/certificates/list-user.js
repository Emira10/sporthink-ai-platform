import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  try {
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({ ok: false, error: "user_id missing" });
    }

    const { data: templates = [], error: templatesError } = await supabaseAdmin
      .from("certificate_templates")
      .select("*");

    if (templatesError) {
      return res.status(500).json({
        ok: false,
        step: "certificate_templates",
        error: templatesError.message,
      });
    }

    const { data: ownedCerts = [], error: certsError } = await supabaseAdmin
      .from("user_certificates")
      .select("*")
      .eq("user_id", String(user_id))
      .in("status", ["approved", "unlocked"])
      .order("issued_at", { ascending: false });

    if (certsError) {
      return res.status(500).json({
        ok: false,
        step: "user_certificates",
        error: certsError.message,
      });
    }

    const templateCards = templates.map((t) => {
      const owned = ownedCerts.find(
        (c) => c.template_key === t.template_key
      );

      return {
        id: owned?.id || t.id,
        template_key: t.template_key,
        title: owned?.training_name || t.title,
        description: t.description,
        image_url: t.image_url,
        icon: t.icon || "🎓",
        status: owned ? "unlocked" : "locked",
        issued_at: owned?.issued_at || null,
        training_name: owned?.training_name || t.title,
        score: owned?.score || t.default_score || "92/100",
        level: owned?.level || t.default_level || "ALTIN SEVİYE",
        progress: owned ? 100 : 0,
        requirement: owned
          ? "Sertifika başarıyla açıldı."
          : t.requirement || "Gereklilik tamamlanmalıdır.",
      };
    });

    const roadmapCards = ownedCerts
      .filter((c) => String(c.template_key || "").startsWith("roadmap_"))
      .map((c) => ({
        id: c.id,
        template_key: c.template_key,
        title: c.training_name || "Yol Haritası Sertifikası",
        description:
          "Bu sertifika, öğrencinin ilgili gelişim yol haritasındaki tüm eğitim aşamalarını başarıyla tamamladığını belgelemek amacıyla verilmiştir.",
        image_url: "/certificates/success-level.png",
        icon: "🏆",
        status: "unlocked",
        issued_at: c.issued_at,
        training_name: c.training_name || "Yol Haritası",
        score: c.score || "100/100",
        level: c.level || "ROADMAP UZMANLIK SERTİFİKASI",
        progress: 100,
        requirement: "Tüm yol haritası başarıyla tamamlandı.",
      }));

    const certificates = [
      ...roadmapCards,
      ...templateCards.filter(
        (c) => !String(c.template_key || "").startsWith("roadmap_")
      ),
    ];

    return res.status(200).json({ ok: true, certificates });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      step: "catch",
      error: err.message,
    });
  }
}