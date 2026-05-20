import formidable from "formidable";
import fs from "fs";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false });
  }

  try {
    const form = formidable({ multiples: false });

    const { fields, files } = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve({ fields, files });
      });
    });

    const file = Array.isArray(files.file) ? files.file[0] : files.file;

    if (!file) {
      return res.status(400).json({
        ok: false,
        message: "Dosya bulunamadı",
      });
    }

    const originalName = file.originalFilename || "training-file";
    const ext = originalName.split(".").pop();
    const safeName = originalName
  .toLowerCase()
  .replaceAll("ı", "i")
  .replaceAll("ğ", "g")
  .replaceAll("ü", "u")
  .replaceAll("ş", "s")
  .replaceAll("ö", "o")
  .replaceAll("ç", "c")
  .replace(/\s+/g, "-")
  .replace(/[^a-z0-9.-]/g, "");

const fileName = `trainings/${Date.now()}-${safeName}`;

    const buffer = fs.readFileSync(file.filepath);

    const { error } = await supabaseAdmin.storage
      .from("training-files")
      .upload(fileName, buffer, {
        contentType: file.mimetype || "application/octet-stream",
        upsert: true,
      });

    if (error) throw error;

    const { data } = supabaseAdmin.storage
      .from("training-files")
      .getPublicUrl(fileName);

    return res.status(200).json({
      ok: true,
      url: data.publicUrl,
      fileName,
      contentType: file.mimetype,
      ext,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: error.message,
    });
  }
}