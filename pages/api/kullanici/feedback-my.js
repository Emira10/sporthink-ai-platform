import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { user_email } = req.query;

    if (!user_email) {
      return res.status(400).json({ error: "user_email zorunludur." });
    }

    const { data, error } = await supabaseAdmin
      .from("feedbacks")
      .select("*")
      .eq("user_email", user_email)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({
      success: true,
      feedbacks: data || [],
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}