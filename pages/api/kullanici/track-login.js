import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    const { user_id, student_name, email } = req.body;

    if (!user_id) {
      return res.status(400).json({ ok: false, error: "user_id gerekli" });
    }

    const { data: existing } = await supabaseAdmin
      .from("user_login_stats")
      .select("*")
      .eq("user_id", user_id)
      .maybeSingle();

    if (existing) {
      const { error } = await supabaseAdmin
        .from("user_login_stats")
        .update({
          login_count: (existing.login_count || 0) + 1,
          student_name: student_name || existing.student_name,
          email: email || existing.email,
          last_login_at: new Date().toISOString(),
        })
        .eq("user_id", user_id);

      if (error) throw error;
    } else {
      const { error } = await supabaseAdmin.from("user_login_stats").insert({
        user_id,
        student_name: student_name || "Kullanıcı",
        email: email || null,
      });

      if (error) throw error;
    }

    await supabaseAdmin.from("user_points").insert({
      user_id,
      student_name: student_name || email || "Kullanıcı",
      points: 0,
      level: 1,
      source: "login_init",
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("track-login error:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}