import { supabaseAdmin } from "../../../lib/supabaseAdmin";

function fallbackQuestions(title, count = 5) {
  const base = [
    {
      question: `${title} eğitiminin temel amacı nedir?`,
      options: ["Konuyu öğretmek", "Sistemi kapatmak", "Verileri silmek", "Yetkisiz erişim"],
      correct_answer: "Konuyu öğretmek",
    },
    {
      question: `${title} eğitimi sonunda katılımcı ne kazanır?`,
      options: ["Bilgi ve beceri", "Hiçbir şey", "Hata mesajı", "Şifre"],
      correct_answer: "Bilgi ve beceri",
    },
    {
      question: `Eğitim sürecinde en önemli unsur nedir?`,
      options: ["Düzenli öğrenme", "Boş bırakmak", "Rastgele cevap", "Eğitimi kapatmak"],
      correct_answer: "Düzenli öğrenme",
    },
  ];

  while (base.length < count) {
    base.push({
      question: `${title} konusu ile ilgili doğru yaklaşım hangisidir?`,
      options: ["Anlayarak uygulamak", "Rastgele işlem yapmak", "Bilgiyi yok saymak", "Sistemi kapatmak"],
      correct_answer: "Anlayarak uygulamak",
    });
  }

  return base.slice(0, count);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { course_id, title, question_count } = req.body;

    const count = Math.min(Math.max(Number(question_count || 5), 1), 20);

    if (!course_id || !title) {
      return res.status(400).json({ error: "course_id ve title zorunlu" });
    }

    let questions = [];
    let source = "ai";

    try {
      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Konu: ${title}

Türkçe ${count} adet çoktan seçmeli sınav sorusu üret.

Kurallar:
- Her soru 4 seçenekli olsun.
- correct_answer mutlaka options içindeki doğru metinle birebir aynı olsun.
- SADECE JSON döndür.

[
  {
    "question": "Soru metni",
    "options": ["A seçeneği", "B seçeneği", "C seçeneği", "D seçeneği"],
    "correct_answer": "Doğru seçeneğin tam metni"
  }
]`,
                  },
                ],
              },
            ],
          }),
        }
      );

      const geminiData = await geminiRes.json();

      if (!geminiData.candidates) {
        throw new Error(geminiData.error?.message || "Gemini cevap vermedi");
      }

      const rawText = geminiData.candidates[0].content.parts[0].text;
      const cleanText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();

      questions = JSON.parse(cleanText).slice(0, count);
    } catch (aiError) {
      console.warn("Gemini çalışmadı, fallback kullanılıyor:", aiError.message);
      questions = fallbackQuestions(title, count);
      source = "ai_fallback";
    }

    const formattedData = questions.map((q) => ({
      egitim_id: course_id,
      title,
      question: q.question,
      options: q.options,
      correct_answer: q.correct_answer,
      source,
    }));

    const { error } = await supabaseAdmin.from("ai_quizzes").insert(formattedData);

    if (error) throw error;

    return res.status(200).json({
      success: true,
      count: formattedData.length,
      source,
    });
  } catch (err) {
    console.error("AI QUIZ ERROR FULL:", err);
    return res.status(500).json({ error: err.message });
  }
}