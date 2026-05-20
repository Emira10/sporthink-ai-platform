import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    const {
      subject,
      message,
      created_by_id,
      created_by_name,
      created_by_role,
      recipients = [],
      module = "general",
    } = req.body;

    if (!subject || !message || !created_by_role || recipients.length === 0) {
      return res.status(400).json({
        success: false,
        message: "subject, message, created_by_role ve recipients gerekli",
      });
    }

    const { data: thread, error: threadError } = await supabaseAdmin
      .from("communication_threads")
      .insert({
        subject,
        created_by_id: created_by_id || null,
        created_by_name: created_by_name || "Kullanıcı",
        created_by_role,
        target_roles: [...new Set(recipients.map((r) => r.role))],
        target_user_ids: recipients.map((r) => r.user_id).filter(Boolean),
        module,
        status: "open",
      })
      .select()
      .single();

    if (threadError) throw threadError;

    const recipientRows = recipients.map((r) => ({
      thread_id: thread.id,
      user_id: r.user_id || null,
      user_name: r.user_name || "Kullanıcı",
      role: r.role,
    }));

    const { error: recError } = await supabaseAdmin
      .from("communication_recipients")
      .insert(recipientRows);

    if (recError) throw recError;

    const { error: msgError } = await supabaseAdmin
      .from("communication_messages")
      .insert({
        thread_id: thread.id,
        sender_id: created_by_id || null,
        sender_name: created_by_name || "Kullanıcı",
        sender_role: created_by_role,
        message,
      });

    if (msgError) throw msgError;

    return res.status(201).json({ success: true, data: thread });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}