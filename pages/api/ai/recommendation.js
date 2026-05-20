export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ success: false });

  try {
    const API_KEY = process.env.GEMINI_API_KEY;

    // 1. أولاً: نكتشف الموديل المتاح في حسابك لتجنب خطأ "Not Found"
    const listModelsRes = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${API_KEY}`);
    const modelsData = await listModelsRes.json();

    if (!listModelsRes.ok) throw new Error("API Key Hatası");

    const availableModel = modelsData.models?.find(m => m.supportedGenerationMethods.includes("generateContent"));
    if (!availableModel) throw new Error("Uygun model bulunamadı");

    const modelName = availableModel.name;

    // 2. ثانياً: نطلب النصيحة باستخدام الموديل الذي وجدناه
    const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1/${modelName}:generateContent?key=${API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: "Öğrenci için kısa, motive edici, 3 maddelik Türkçe bir çalışma önerisi ver. Her seferinde farklı olsun." }]
        }]
      })
    });

    const data = await geminiRes.json();
    const recommendation = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Bugün çalışmaya odaklan!";

    return res.status(200).json({
      success: true,
      recommendation: recommendation
    });

  } catch (err) {
    console.error("HATA DETAYI:", err.message);
    return res.status(500).json({
      success: false,
      error: "Öneri oluşturulamadı: " + err.message
    });
  }
}