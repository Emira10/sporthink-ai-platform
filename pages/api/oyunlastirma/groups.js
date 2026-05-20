import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  try {
    if (req.method !== "GET") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { data, error } = await supabaseAdmin
      .from("social_groups")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return res.status(200).json({
      success: true,
      groups: data || [],
    });
  } catch (err) {
    console.error("groups api error:", err);
    return res.status(500).json({ error: err.message });
  }
}