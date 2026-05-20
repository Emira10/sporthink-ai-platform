import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    const { user_id, role } = req.query;

    if (!role) {
      return res.status(400).json({
        success: false,
        message: "role gerekli",
      });
    }

    const { data: ownedThreads, error: ownedError } = await supabaseAdmin
      .from("communication_threads")
      .select("*")
      .eq("created_by_role", role)
      .eq("created_by_id", user_id || "")
      .order("created_at", { ascending: false });

    if (ownedError) throw ownedError;

    let recipientQuery = supabaseAdmin
      .from("communication_recipients")
      .select("thread_id, is_read, role, user_id, communication_threads(*)")
      .eq("role", role);

    if (user_id) {
      recipientQuery = recipientQuery.or(`user_id.eq.${user_id},user_id.is.null`);
    }

    const { data: receivedRows, error: receivedError } = await recipientQuery;

    if (receivedError) throw receivedError;

    const receivedThreads = (receivedRows || [])
      .map((row) => ({
        ...row.communication_threads,
        is_read: row.is_read,
      }))
      .filter(Boolean);

    const merged = [...(ownedThreads || []), ...receivedThreads];

    const unique = Array.from(
      new Map(merged.map((item) => [item.id, item])).values()
    ).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return res.status(200).json({ success: true, data: unique });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}