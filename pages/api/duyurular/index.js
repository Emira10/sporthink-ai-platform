import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({
      success: false,
      ok: false,
      message: "Method not allowed",
    });
  }

  try {
    const targetRole = req.query.target_role || "kullanici";
    const userId = req.query.user_id || "demo-user";

    const { data: announcements = [], error } = await supabaseAdmin
      .from("announcements")
      .select("*")
      .or(`target_role.eq.${targetRole},target_role.eq.all`)
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) throw error;

    const ids = announcements.map((item) => item.id);

    let reads = [];

    if (ids.length > 0) {
      const { data: readData = [], error: readError } = await supabaseAdmin
        .from("duyuru_interactions")
        .select("duyuru_id")
        .eq("user_id", userId)
        .eq("action", "read")
        .in("duyuru_id", ids);

      if (readError) throw readError;
      reads = readData;
    }

    const readSet = new Set(reads.map((item) => item.duyuru_id));

    const formatted = announcements.map((item) => ({
      id: item.id,
      title: item.title || item.subject || "Duyuru",
      message: item.message || item.content || item.description || "",
      sender_name: item.sender_name || item.created_by_name || "SportThink",
      sender_role: item.sender_role || item.role || "Sistem",
      target_role: item.target_role || "kullanici",
      type: item.type || item.category || "sistem",
      priority: item.priority || "normal",
      is_pinned: Boolean(item.is_pinned),
      attachment_url: item.attachment_url || item.file_url || null,
      is_read: readSet.has(item.id),
      created_at: item.created_at
        ? new Date(item.created_at).toLocaleString("tr-TR")
        : "",
    }));

    return res.status(200).json({
      success: true,
      ok: true,
      data: formatted,
      duyurular: formatted,
    });
  } catch (error) {
    console.error("DUYURULAR INDEX API ERROR:", error);

    return res.status(500).json({
      success: false,
      ok: false,
      message: error.message || "Duyurular alınamadı",
    });
  }
}