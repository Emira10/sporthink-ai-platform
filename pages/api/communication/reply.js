import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    const {
      thread_id,
      sender_id,
      sender_name,
      sender_role,
      message,
    } = req.body;

    if (!thread_id || !sender_role || !message) {
      return res.status(400).json({
        success: false,
        message: "thread_id, sender_role ve message gerekli",
      });
    }

    const { data, error } = await supabaseAdmin
      .from("communication_messages")
      .insert({
        thread_id,
        sender_id: sender_id || null,
        sender_name: sender_name || "Kullanıcı",
        sender_role,
        message,
      })
      .select()
      .single();

    if (error) throw error;

    await supabaseAdmin
      .from("communication_threads")
      .update({ status: "open" })
      .eq("id", thread_id);

    return res.status(201).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}