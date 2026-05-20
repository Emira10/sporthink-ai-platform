import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  try {
    const { id, title, category, description } = req.body;

    if (!id) {
      return res.status(400).json({ error: "ID zorunlu" });
    }

    const { data, error } = await supabaseAdmin
      .from("trainings")
      .update({
        title,
        category,
        description,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json({
      ok: true,
      course: data,
    });
  } catch (err) {
    console.error("UPDATE COURSE ERROR:", err);

    return res.status(500).json({
      error: err.message,
    });
  }
}