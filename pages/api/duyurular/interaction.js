import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, ok: false });
  }

  try {
    const { id, duyuru_id, action, user_id, user_name, role } = req.body;

    const finalId = id || duyuru_id;
    const finalAction = action || "read";
    const finalUserId = user_id || "demo-user";

    if (!finalId || !finalAction) {
      return res.status(400).json({
        success: false,
        ok: false,
        message: "id/duyuru_id ve action gerekli",
      });
    }

    await supabaseAdmin.from("duyuru_interactions").upsert(
  {
    duyuru_id: finalId,
    user_id: finalUserId,
    user_name: user_name || finalUserId,
    role: role || "unknown",
    action: finalAction,
    created_at: new Date().toISOString(),
  },
  { onConflict: "duyuru_id,user_id,action" }
);

    if (finalAction === "read") {
      const { error: readError } = await supabaseAdmin
        .from("duyuru_interactions")
        .upsert(
          {
            duyuru_id: finalId,
            user_id: finalUserId,
            action: "read",
            created_at: new Date().toISOString(),
          },
          { onConflict: "duyuru_id,user_id,action" }
        );

      if (readError) {
        return res.status(500).json({
          success: false,
          ok: false,
          message: readError.message,
        });
      }

      const { data: current, error: getError } = await supabaseAdmin
        .from("announcements")
        .select("views")
        .eq("id", finalId)
        .single();

      if (!getError) {
        await supabaseAdmin
          .from("announcements")
          .update({ views: (current?.views || 0) + 1 })
          .eq("id", finalId);
      }

      return res.status(200).json({ success: true, ok: true });
    }

    const column =
      finalAction === "view"
        ? "views"
        : finalAction === "click"
        ? "clicks"
        : finalAction === "reaction"
        ? "reactions"
        : null;

    if (!column) {
      return res.status(400).json({
        success: false,
        ok: false,
        message: "Geçersiz action",
      });
    }

    const { data: current, error: getError } = await supabaseAdmin
      .from("announcements")
      .select(column)
      .eq("id", finalId)
      .single();

    if (getError) {
      return res.status(500).json({
        success: false,
        ok: false,
        message: getError.message,
      });
    }

    const { error } = await supabaseAdmin
      .from("announcements")
      .update({ [column]: (current?.[column] || 0) + 1 })
      .eq("id", finalId);

    if (error) {
      return res.status(500).json({
        success: false,
        ok: false,
        message: error.message,
      });
    }

    return res.status(200).json({ success: true, ok: true });
  } catch (error) {
    console.error("DUYURU INTERACTION API ERROR:", error);

    return res.status(500).json({
      success: false,
      ok: false,
      message: error.message || "Duyuru etkileşimi kaydedilemedi",
    });
  }
}