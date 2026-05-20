import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import { updateInstructorActivity } from "../../../lib/updateInstructorActivity";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, message: "Sadece POST desteklenir" });
  }

  try {
    const { title, content, target_dept } = req.body;

    if (!title?.trim() || !content?.trim()) {
      return res.status(400).json({
        ok: false,
        message: "Başlık ve içerik zorunludur.",
      });
    }

    const { data, error } = await supabaseAdmin
      .from("announcements")
      .insert([
        {
          title: title.trim(),
          content: content.trim(),
          target_dept: target_dept || "All",
          created_by: "Eğitmen",
          status: "active",
        },
      ])
      .select()
      .single();

    if (error) {
  console.error("CREATE ANNOUNCEMENT ERROR:", error);
  return res.status(500).json({ ok: false, message: error.message });
}

    await updateInstructorActivity(supabaseAdmin, "test@test.com");
    return res.status(200).json({ ok: true, announcement: data });
  } catch (err) {
    return res.status(500).json({ ok: false, message: err.message });
  }
}