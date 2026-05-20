import PDFDocument from "pdfkit";
import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export default async function handler(req, res) {
  try {
    const { id } = req.query;

    const { data: cert, error } = await supabaseAdmin
      .from("user_certificates")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    if (!cert) return res.status(404).json({ error: "Sertifika bulunamadı" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${cert.student_name || "sertifika"}.pdf"`
    );

    const doc = new PDFDocument({ size: "A4", margin: 50 });
    doc.pipe(res);

    doc.fontSize(24).text("SPORTTHINK", { align: "center" });
    doc.moveDown();
    doc.fontSize(20).text(cert.certificate_type || "Sertifika", {
      align: "center",
    });

    doc.moveDown(2);
    doc.fontSize(14).text("Bu sertifika,", { align: "center" });
    doc.moveDown();
    doc.fontSize(22).text(cert.student_name || "Kullanıcı", {
      align: "center",
    });

    doc.moveDown();
    doc.fontSize(14).text(
      `${cert.course_title || "Eğitim"} eğitimini başarıyla tamamladığını belgelemek amacıyla verilmiştir.`,
      { align: "center" }
    );

    doc.moveDown(2);
    doc.fontSize(13).text(`Puan: ${cert.score || 0}/100`);
    doc.text(`Durum: ${cert.status || "pending"}`);
    doc.text(
      `Tarih: ${
        cert.issued_at
          ? new Date(cert.issued_at).toLocaleDateString("tr-TR")
          : "-"
      }`
    );

    doc.moveDown(3);
    doc.fontSize(12).text("SportThink İnsan Kaynakları ve Eğitim Departmanı", {
      align: "center",
    });

    doc.end();
  } catch (error) {
    console.error("Certificate PDF error:", error);
    res.status(500).json({ error: error.message });
  }
}