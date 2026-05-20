export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST only" });
  }

  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: "Mesaj boş!" });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "GEMINI_API_KEY bulunamadı!" });
    }

    const modelsToTry = [
      "gemini-2.5-flash",
      "gemini-2.0-flash-001",
      "gemini-3-flash-preview",
      "gemini-3.1-pro-preview"
    ];

    let lastError = "";

    for (const model of modelsToTry) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-goog-api-key": apiKey,
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: `Sen SporThink Academy eğitmen panelinde çalışan Türkçe AI asistansın. Kısa, net ve faydalı cevap ver.\n\nKullanıcı: ${message}`,
                    },
                  ],
                },
              ],
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          lastError = `${model}: ${data?.error?.message || response.statusText}`;
          continue;
        }

        const reply =
          data?.candidates?.[0]?.content?.parts?.[0]?.text ||
          "Cevap oluşturulamadı.";

        return res.status(200).json({ reply, model });
      } catch (err) {
        lastError = `${model}: ${err.message}`;
      }
    }

    return res.status(500).json({
      error: "Hiçbir Gemini modeli çalışmadı. Son hata: " + lastError,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message || "AI Connection Error",
    });
  }
}