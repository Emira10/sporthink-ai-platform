import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  try {
    if (req.method !== "DELETE") {
      return res.status(405).json({ ok: false, message: "Method not allowed" });
    }

    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ ok: false, message: "Quiz ID gerekli." });
    }

    await supabaseAdmin.from("quiz_questions").delete().eq("quiz_id", id);

    const { error } = await supabaseAdmin
      .from("quizzes")
      .delete()
      .eq("id", id);

    if (error) throw error;

    await supabaseAdmin.from("activity_logs").insert({
      activity_type: "quiz_deleted",
      user_name: "Eğitmen",
      activity_text: `Quiz silindi (#${id})`,
    });

    return res.status(200).json({ ok: true });
  } catch (error) {
    return res.status(500).json({ ok: false, message: error.message });
  }
}