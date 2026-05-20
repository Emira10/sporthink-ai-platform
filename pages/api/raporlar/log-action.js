import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ ok: false, error: "Method not allowed" });
    }

    const { action_type, report_range, department, risk_filter } = req.body;

    const { error } = await supabaseAdmin.from("report_logs").insert({
      action_type,
      report_range,
      department,
      risk_filter,
    });

    if (error) throw error;

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("log action error:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}