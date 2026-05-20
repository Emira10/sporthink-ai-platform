import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ ok: false, message: "Method not allowed" });
    }

    const { type, payload } = req.body;

    if (!type || !payload) {
      return res.status(400).json({ ok: false, message: "Eksik veri" });
    }

    let result = null;

    if (type === "badge") {
      const { data, error } = await supabaseAdmin
        .from("badges")
        .insert({
          title: payload.title,
          required_points: Number(payload.required_points),
          icon: payload.icon || "🏅",
        })
        .select("*")
        .single();

      if (error) throw error;
      result = data;

      await supabaseAdmin.from("activity_logs").insert({
        activity_type: "badge_created",
        user_name: "Eğitmen",
        activity_text: `${payload.title} rozeti oluşturuldu`,
      });
    }

    if (type === "group") {
      const { data, error } = await supabaseAdmin
        .from("social_groups")
        .insert({
          title: payload.title,
          interest_area: payload.interest_area || "",
        })
        .select("*")
        .single();

      if (error) throw error;
      result = data;

      await supabaseAdmin.from("activity_logs").insert({
        activity_type: "group_created",
        user_name: "Eğitmen",
        activity_text: `${payload.title} grubu oluşturuldu`,
      });
    }

    if (type === "mission") {
      const { data, error } = await supabaseAdmin
        .from("announcements")
        .insert({
          title: payload.title,
          content: `${payload.description} | Sınav: ${payload.exam_title}`,
          target_dept: "Kullanıcı",
        })
        .select("*")
        .single();

      if (error) throw error;
      result = data;

      await supabaseAdmin.from("activity_logs").insert({
        activity_type: "mission_created",
        user_name: "Eğitmen",
        activity_text: `${payload.title} görevi öğrencilere gönderildi`,
      });
    }

    if (type === "question") {
      const { data, error } = await supabaseAdmin
        .from("quiz_questions")
        .insert({
          quiz_id: payload.quiz_id,
          question_text: payload.question_text,
          option_a: payload.option_a,
          option_b: payload.option_b,
          option_c: payload.option_c,
          option_d: payload.option_d,
          correct_answer: payload.correct_answer,
        })
        .select("*")
        .single();

      if (error) throw error;
      result = data;

      await supabaseAdmin.from("activity_logs").insert({
        activity_type: "question_created",
        user_name: "Eğitmen",
        activity_text: "Yeni quiz sorusu oluşturuldu",
      });
    }

    return res.status(200).json({ ok: true, data: result });
  } catch (error) {
    console.error("manage-gamification error:", error);
    return res.status(500).json({ ok: false, message: error.message });
  }
}