import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  try {
    if (req.method !== "DELETE") {
      return res.status(405).json({
        ok: false,
        message: "Method not allowed",
      });
    }

    const { type, id } = req.body;

    if (!type || !id) {
      return res.status(400).json({
        ok: false,
        message: "Eksik veri",
      });
    }

    // BADGE
    if (type === "badge") {
      const { error } = await supabaseAdmin
        .from("badges")
        .delete()
        .eq("id", id);

      if (error) throw error;

      await supabaseAdmin.from("activity_logs").insert({
        activity_type: "badge_deleted",
        user_name: "Eğitmen",
        activity_text: "Rozet silindi",
      });
    }

    // GROUP
    if (type === "group") {
      await supabaseAdmin
        .from("social_group_members")
        .delete()
        .eq("group_id", id);

      const { error } = await supabaseAdmin
        .from("social_groups")
        .delete()
        .eq("id", id);

      if (error) throw error;

      await supabaseAdmin.from("activity_logs").insert({
        activity_type: "group_deleted",
        user_name: "Eğitmen",
        activity_text: "Grup silindi",
      });
    }

    // QUESTION
    if (type === "question") {
      const { error } = await supabaseAdmin
        .from("quiz_questions")
        .delete()
        .eq("id", id);

      if (error) throw error;

      await supabaseAdmin.from("activity_logs").insert({
        activity_type: "question_deleted",
        user_name: "Eğitmen",
        activity_text: "Quiz sorusu silindi",
      });
    }

    return res.status(200).json({
      ok: true,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      ok: false,
      message: error.message,
    });
  }
}