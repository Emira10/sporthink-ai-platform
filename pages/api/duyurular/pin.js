import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    const { id, is_pinned } = req.body;

    if (!id) {
      return res.status(400).json({ success: false, message: "id gerekli" });
    }

    const nextPinned = !Boolean(is_pinned);

    const { data, error } = await supabaseAdmin
      .from("announcements")
      .update({
        is_pinned: nextPinned,
        pinned: nextPinned,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json({
      success: true,
      ok: true,
      data,
    });
  } catch (error) {
    console.error("PIN API ERROR:", error);

    return res.status(500).json({
      success: false,
      ok: false,
      message: error.message || "Pin işlemi başarısız",
    });
  }
}