import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    const { thread_id, user_id, role } = req.body;

    if (!thread_id || !role) {
      return res.status(400).json({
        success: false,
        message: "thread_id ve role gerekli",
      });
    }

    let query = supabaseAdmin
      .from("communication_recipients")
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq("thread_id", thread_id)
      .eq("role", role);

    if (user_id) {
      query = query.eq("user_id", user_id);
    }

    const { error } = await query;

    if (error) throw error;

    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}