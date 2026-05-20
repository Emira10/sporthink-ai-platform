import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, message: "Method not allowed" });
  }

  try {
    const { email, fileName, fileBase64 } = req.body;

    if (!email || !fileName || !fileBase64) {
      return res.status(400).json({ ok: false, message: "Eksik bilgi" });
    }

    const base64Data = fileBase64.split(",")[1];
    const buffer = Buffer.from(base64Data, "base64");
    const safeEmail = email.replace(/[^a-zA-Z0-9]/g, "_");

const ext = fileName.split(".").pop()?.toLowerCase() || "jpg";

const safeFileName = `avatar-${Date.now()}.${ext}`;

const path = `${safeEmail}/${safeFileName}`;

    const { error } = await supabaseAdmin.storage
      .from("instructor-avatars")
      .upload(path, buffer, {
        contentType: "image/jpeg",
        upsert: true,
      });

    if (error) {
  console.error("UPLOAD AVATAR ERROR:", error);
  return res.status(500).json({ ok: false, message: error.message });
}

    const { data } = supabaseAdmin.storage
      .from("instructor-avatars")
      .getPublicUrl(path);

    return res.status(200).json({
      ok: true,
      avatar_url: data.publicUrl,
    });
  } catch (err) {
    return res.status(500).json({ ok: false, message: err.message });
  }
}