export default async function handler(req, res) {
  try {
    const { topic, level, duration } = req.body;

    const plan = `
📚 Konu: ${topic}
🎯 Seviye: ${level}
⏳ Süre: ${duration}

Gün 1: Temel kavramlar
Gün 2: Uygulama
Gün 3: Küçük proje
Gün 4: Tekrar
`;

    return res.status(200).json({
      success: true,
      plan,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
}