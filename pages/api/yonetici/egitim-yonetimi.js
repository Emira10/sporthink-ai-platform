import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const { data, error } = await supabaseAdmin
        .from("yonetici_egitimler")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) return res.status(500).json({ error: error.message });

      const activeCount = data.filter((e) => e.status === "active").length;
      const totalParticipants = data.reduce(
        (sum, e) => sum + Number(e.participant_count || 0),
        0
      );

      const avgCompletion =
        data.length > 0
          ? Math.round(
              data.reduce((sum, e) => sum + Number(e.completion_rate || 0), 0) /
                data.length
            )
          : 0;

      return res.status(200).json({
        egitimler: data,
        stats: {
          activeCount,
          totalParticipants,
          completionRate: avgCompletion,
        },
      });
    }

    if (req.method === "POST") {
      const { title, category, description, content } = req.body;

      if (!title) {
        return res.status(400).json({ error: "Eğitim başlığı zorunlu" });
      }

      const { data, error } = await supabaseAdmin
        .from("yonetici_egitimler")
        .insert([
          {
            title,
            category: category || "AI Destekli Eğitim",
            description,
            content,
            participant_count: 0,
            completion_rate: 0,
            status: "active",
            created_by: "AI",
          },
        ])
        .select()
        .single();

      if (error) return res.status(500).json({ error: error.message });

      return res.status(201).json({ egitim: data });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    return res.status(500).json({ error: "Sunucu hatası" });
  }
}