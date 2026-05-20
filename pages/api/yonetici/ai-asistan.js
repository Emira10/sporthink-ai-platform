import { supabaseAdmin } from "../../../lib/supabaseAdmin";

function isPlatformQuestion(message = "") {
  const q = message.toLowerCase();

  return (
    q.includes("öğrenci") ||
    q.includes("kullanıcı") ||
    q.includes("kullanici") ||
    q.includes("eğitim") ||
    q.includes("egitim") ||
    q.includes("quiz") ||
    q.includes("sınav") ||
    q.includes("sinav") ||
    q.includes("sertifika") ||
    q.includes("departman") ||
    q.includes("aktif") ||
    q.includes("başarı") ||
    q.includes("basari") ||
    q.includes("performans") ||
    q.includes("risk")
  );
}

async function getPlatformContext() {
  const { data: users = [] } = await supabaseAdmin
    .from("kullanicilar")
    .select("kullanici_id, ad, soyad, e_posta, tur_id, departman, son_giris_tarihi")
    .limit(20);

  const { data: trainings = [] } = await supabaseAdmin
    .from("trainings")
    .select("id, title, category, created_at")
    .limit(20);

  const { data: quizzes = [] } = await supabaseAdmin
    .from("quiz_results")
    .select("*")
    .limit(30);

  const activeUsers = users.filter((u) => u.son_giris_tarihi).slice(0, 10);

  return `
PLATFORM CANLI VERİ ÖZETİ:

Kullanıcı sayısı: ${users.length}
Aktif kullanıcı örnekleri:
${activeUsers
  .map((u) => `- ${u.ad || ""} ${u.soyad || ""} | ${u.e_posta} | ${u.departman || "Genel"}`)
  .join("\n")}

Eğitim sayısı: ${trainings.length}
Eğitim örnekleri:
${trainings
  .map((t) => `- ${t.title || "Başlıksız"} | ${t.category || "Genel"}`)
  .join("\n")}

Quiz/Sınav sonucu kayıt sayısı: ${quizzes.length}
Quiz veri örnekleri:
${quizzes
  .slice(0, 10)
  .map((q) => `- ${JSON.stringify(q)}`)
  .join("\n")}
`;
}

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({
        ok: false,
        error: "Method not allowed",
      });
    }

    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        ok: false,
        error: "Mesaj zorunlu",
      });
    }

    let platformContext = "";

    if (isPlatformQuestion(message)) {
      platformContext = await getPlatformContext();
    }

    const prompt = `
Sen SporThink platformunun profesyonel yönetici AI asistanısın.

Görevlerin:
- Genel konuları açıklamak
- Eğitim performansını analiz etmek
- Quiz sonuçlarını yorumlamak
- Yöneticiye stratejik öneriler vermek
- Öğrenci gelişim süreçlerini değerlendirmek
- Eğitim roadmap önerileri oluşturmak
- Kurumsal ve profesyonel cevaplar vermek

Kurallar:
- Eğer soru genel bilgi sorusuysa genel cevap ver.
- Eğer soru SporThink platformu, kullanıcı, eğitim, quiz, sertifika veya performans ile ilgiliyse aşağıdaki canlı platform verilerini kullan.
- Veride olmayan şeyi kesin bilgi gibi söyleme.
- Kısa, profesyonel ve maddeli cevap ver.
- Yönetici karar desteği gibi konuş.

${platformContext ? platformContext : "Bu soru genel bilgi sorusu olabilir. Platform verisi eklenmedi."}

Yönetici Mesajı:
${message}
`;

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          generationConfig: {
            temperature: 0.6,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 800,
          },
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }],
            },
          ],
        }),
      }
    );

    const data = await geminiRes.json();

    if (data.error) {
      console.log("GEMINI FALLBACK:", data.error.message);

      return res.status(200).json({
        ok: true,
        answer:
          "AI sistemi şu anda gerçek zamanlı cevap üretemiyor. Ancak yönetici panelindeki eğitim, kullanıcı ve performans verileri takip edilmeye devam ediyor.",
      });
    }

    const answer = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!answer || !answer.trim()) {
      return res.status(500).json({
        ok: false,
        error: "AI cevap üretemedi",
      });
    }

    return res.status(200).json({
      ok: true,
      answer: answer.trim(),
    });
  } catch (err) {
    console.error("AI ERROR:", err);

    return res.status(500).json({
      ok: false,
      error: err?.message || "AI sistemi şu anda cevap veremiyor.",
    });
  }
}