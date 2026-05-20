import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false });
  }

  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "id gerekli",
      });
    }

    const { data = [], error } = await supabaseAdmin
      .from("duyuru_interactions")
      .select("user_id,user_name,role,action,created_at")
      .eq("duyuru_id", id)
      .in("action", ["view", "read"])
      .order("created_at", { ascending: false });

    if (error) throw error;

    const uniqueMap = new Map();

    data.forEach((item) => {
      const key = item.user_id || item.user_name;
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, item);
      }
    });

    const viewers = Array.from(uniqueMap.values());

    return res.status(200).json({
      success: true,
      count: viewers.length,
      viewers,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}