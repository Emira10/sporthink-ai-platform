import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  try {
    if (req.method !== "DELETE") {
      return res.status(405).json({ ok: false, message: "Method not allowed" });
    }

    const { fileName } = req.body;

    if (!fileName) {
      return res.status(400).json({ ok: false, message: "fileName gerekli" });
    }

    const filePath = `trainings/${fileName}`;

    const { error } = await supabaseAdmin.storage
      .from("training-files")
      .remove([filePath]);

    if (error) throw error;

    return res.status(200).json({ ok: true });
  } catch (error) {
    return res.status(500).json({ ok: false, message: error.message });
  }
}