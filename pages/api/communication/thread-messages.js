import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    const { thread_id } = req.query;

    if (!thread_id) {
      return res.status(400).json({
        success: false,
        message: "thread_id gerekli",
      });
    }

    const { data, error } = await supabaseAdmin
      .from("communication_messages")
      .select("*")
      .eq("thread_id", thread_id)
      .order("created_at", { ascending: true });

    if (error) throw error;

    return res.status(200).json({ success: true, data: data || [] });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}