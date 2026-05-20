import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import { updateInstructorActivity } from "../../../lib/updateInstructorActivity";

export default async function handler(req, res) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ ok: false, message: "Sadece DELETE desteklenir" });
  }

  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({
        ok: false,
        message: "Duyuru ID zorunludur.",
      });
    }

    const { error } = await supabaseAdmin
      .from("announcements")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("DELETE ANNOUNCEMENT ERROR:", error);
      return res.status(500).json({ ok: false, message: error.message });
    }

    await updateInstructorActivity(supabaseAdmin, "test@test.com");

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("DELETE ANNOUNCEMENT GENERAL ERROR:", err);
    return res.status(500).json({
      ok: false,
      message: err.message || "Sunucu hatası",
    });
  }
}