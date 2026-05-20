import { supabaseAdmin } from "../../../lib/supabaseAdmin";
import { updateInstructorActivity } from "../../../lib/updateInstructorActivity";

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const email = req.query.email || "test@test.com";

      const { data: profile } = await supabaseAdmin
        .from("instructor_profiles")
        .select("*")
        .eq("email", email)
        .maybeSingle();

        if (profile?.email) {
  await supabaseAdmin
    .from("instructor_profiles")
    .update({
      last_login_at: new Date().toISOString(),
      activity_status: "Online",
    })
    .eq("email", profile.email);
}

      const { data: courses } = await supabaseAdmin
        .from("egitim_katalogu")
        .select("aktif_mi");

      const { data: quizzes } = await supabaseAdmin
        .from("quizzes")
        .select("id");

      return res.status(200).json({
        ok: true,
        profile: profile || {
          full_name: "Eğitmen",
          email,
          expertise: "Online Eğitim ve İçerik Yönetimi",
          role: "Eğitmen",
          account_status: "Aktif",
          system_name: "SporThink Academy",
          last_login_at: new Date().toISOString(),
permissions: "Courses / Quizzes / Analytics",
activity_status: "Online",
api_status: "Online",
database_status: "Connected",
storage_status: "Healthy",
          support_status: "AI Asistan Aktif",
          bio: "Yapay zeka destekli eğitim sistemleri ve dijital öğrenme deneyimleri üzerine çalışan eğitmen.",
          verified: true,
        },
        stats: {
          courses: courses?.length || 0,
          quizzes: quizzes?.length || 0,
          active: courses?.filter((x) => x.aktif_mi).length || 0,
        },
      });
    }

    if (req.method === "POST") {
      const { full_name, email, expertise, avatar_url, bio } = req.body;

      if (!email?.trim()) {
        return res.status(400).json({
          ok: false,
          message: "Email zorunludur.",
        });
      }

      const { data, error } = await supabaseAdmin
        .from("instructor_profiles")
        .upsert(
          {
            full_name: full_name?.trim() || "Eğitmen",
            email: email.trim(),
            expertise: expertise?.trim() || "Online Eğitim ve İçerik Yönetimi",
            avatar_url: avatar_url || null,
            bio: bio?.trim() || "Yapay zeka destekli eğitim sistemleri ve dijital öğrenme deneyimleri üzerine çalışan eğitmen.",
            verified: true,
            last_login_at: new Date().toISOString(),
permissions: "Courses / Quizzes / Analytics",
activity_status: "Online",
api_status: "Online",
database_status: "Connected",
storage_status: "Healthy",
            updated_at: new Date().toISOString(),
          },
          { onConflict: "email" }
        )
        .select()
        .single();

      if (error) {
  console.error("PROFILE SAVE ERROR:", error);
  return res.status(500).json({
    ok: false,
    message: error.message,
  });
}

      await updateInstructorActivity(supabaseAdmin, email.trim());

      return res.status(200).json({
        ok: true,
        profile: data,
      });
    }

    return res.status(405).json({
      ok: false,
      message: "Method not allowed",
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      message: err.message || "Sunucu hatası",
    });
  }
}