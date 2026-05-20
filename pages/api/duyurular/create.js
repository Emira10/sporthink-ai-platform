import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      ok: false,
      message: "Method not allowed",
    });
  }

  try {
    const {
      title,
      description,
      message,
      content,
      type,
      priority,
      target_role,
      pinned,
      is_pinned,
      module,
      sender_name,
      sender_role,
      author,
      attachment_url,
      file_url,
    } = req.body;

    if (!title || !(description || message || content)) {
      return res.status(400).json({
        success: false,
        ok: false,
        message: "Başlık ve açıklama gerekli",
      });
    }

    const finalContent = description || message || content || "";
    const finalSenderName = sender_name || author || "Yönetici";
    const finalSenderRole = sender_role || author || "Yönetici";

    const targetRoles = String(target_role || "all")
      .split(",")
      .map((r) => r.trim())
      .filter(Boolean);

    const rows = targetRoles.map((role) => ({
      title,
      content: finalContent,
      message: finalContent,
      type: type || "egitim",
      priority: priority || "normal",
      target_role: role,
      pinned: Boolean(pinned || is_pinned),
      is_pinned: Boolean(is_pinned || pinned),
      author: author || finalSenderName,
      sender_name: finalSenderName,
      sender_role: finalSenderRole,
      module: module || "general",
      attachment_url: attachment_url || file_url || null,
      views: 0,
      clicks: 0,
      reactions: 0,
      created_at: new Date().toISOString(),
    }));

    const { data, error } = await supabaseAdmin
      .from("announcements")
      .insert(rows)
      .select();

    if (error) {
      return res.status(500).json({
        success: false,
        ok: false,
        message: error.message,
      });
    }

    return res.status(201).json({
      success: true,
      ok: true,
      data: Array.isArray(data) ? data[0] : data,
      rows: data,
    });
  } catch (error) {
    console.error("CREATE ANNOUNCEMENT ERROR:", error);

    return res.status(500).json({
      success: false,
      ok: false,
      message: error.message || "Duyuru oluşturulamadı",
    });
  }
}