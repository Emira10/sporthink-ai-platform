import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ success: false });

  try {
    const { message, user_id, user_email } = req.body;
    const API_KEY = process.env.GEMINI_API_KEY;

    // 1. جلب قائمة الموديلات المتاحة لمفتاحك فعلياً
    const listModelsRes = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${API_KEY}`);
    const modelsData = await listModelsRes.json();

    if (!listModelsRes.ok) {
      throw new Error("API Key geçersiz veya kısıtlı: " + (modelsData.error?.message || "Bilinmeyen hata"));
    }

    // 2. البحث عن أول موديل يدعم توليد المحتوى في حسابك
    const availableModel = modelsData.models?.find(m => m.supportedGenerationMethods.includes("generateContent"));

    if (!availableModel) {
      throw new Error("Hesabınızda uygun bir AI modeli bulunamadı.");
    }

    const modelName = availableModel.name; // سيأخذ الاسم الصحيح مثل models/gemini-1.5-flash
    console.log("Kullanılan Model:", modelName);

    // 3. استخدام الموديل المكتشف لإرسال السؤال
    const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1/${modelName}:generateContent?key=${API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `Sen bir eğitim mentorusun. Türkçe cevap ver: ${message}` }] }]
      })
    });

    const geminiData = await geminiRes.json();

    if (!geminiRes.ok) throw new Error(geminiData.error?.message || "AI Hatası");

    const answer = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || "Cevap alınamadı";

    // 4. الحفظ في Supabase
    await supabaseAdmin.from("ai_chat_logs").insert([
      { user_id: user_id || null, user_email: user_email || "anonim", question: message, answer: answer }
    ]);

    return res.status(200).json({ success: true, answer });

  } catch (err) {
    console.error("DETAYLI HATA:", err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
}