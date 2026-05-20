import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  try {
    const { data, error } = await supabaseAdmin
      .from("ai_chat_logs")
      .select("*")
      .order("created_at", { ascending: true })
      .limit(50);

    if (error) throw error;

    const formatted = (data || []).flatMap((row) => [
      { role: "user", text: row.question },
      { role: "ai", text: row.answer },
    ]);

    return res.status(200).json({
      success: true,
      history: formatted,
    });
  } catch (err) {
    console.error("history api error:", err);

    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
}