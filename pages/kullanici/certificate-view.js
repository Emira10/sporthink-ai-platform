import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function CertificateView() {
  const router = useRouter();
  const [userName, setUserName] = useState("Ad Soyad");
  const [cert, setCert] = useState(null);

  useEffect(() => {
    const name =
      localStorage.getItem("userName") ||
      localStorage.getItem("fullName") ||
      "Ad Soyad";
    setUserName(name);

    const saved = localStorage.getItem("selectedCertificate");
    if (saved) setCert(JSON.parse(saved));
  }, []);

  const trainingName = cert?.training_name || "Eğitim Adı";
  const date = cert?.issued_at
    ? new Date(cert.issued_at).toLocaleDateString("tr-TR")
    : new Date().toLocaleDateString("tr-TR");
  const score = cert?.score || "92/100";
  const level = cert?.level || "ALTIN SEVİYE";

  const trainingNameSize =
    trainingName.length > 65
      ? "text-[22px]"
      : trainingName.length > 45
      ? "text-[25px]"
      : trainingName.length > 30
      ? "text-[29px]"
      : "text-[34px]";

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6">
      <style
        dangerouslySetInnerHTML={{
          __html: `
@media print {
  @page { size: A4 landscape; margin: 0; }

  html, body {
    margin: 0 !important;
    padding: 0 !important;
    overflow: hidden !important;
    background: white !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .no-print { display: none !important; }

  #certificate {
    width: 297mm !important;
    height: 210mm !important;
    margin: 0 !important;
    box-shadow: none !important;
    transform: none !important;
  }
}
          `,
        }}
      />

      <div className="w-full max-w-[1123px] flex justify-between items-center mb-5 no-print">
        <button
          onClick={() => router.back()}
          className="px-6 py-3 rounded-xl bg-white/10 text-white font-black text-xs uppercase tracking-widest hover:bg-white/20 transition-all"
        >
          ← Geri Dön
        </button>

        <button
          onClick={() => window.print()}
          className="px-6 py-3 rounded-xl bg-[#E61A21] text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-red-600/30"
        >
          Yazdır / PDF
        </button>
      </div>

      <div
        id="certificate"
        className="relative w-[1123px] h-[794px] max-w-full bg-white shadow-2xl overflow-hidden"
      >
        <img
          src="/certificates/success-level.png"
          alt="Certificate Background"
          className="absolute inset-0 w-full h-full object-cover"
        />

        <div className="absolute top-[11%] left-1/2 -translate-x-1/2 w-full text-center">
          <h1 className="font-serif text-[52px] leading-[0.95] font-black tracking-[0.06em] text-[#a77a14] uppercase">
            BAŞARI VE SEVİYE<br />SERTİFİKASI
          </h1>
        </div>

        <div className="absolute top-[29%] left-1/2 -translate-x-1/2 text-center">
          <p className="font-serif text-[20px] font-bold text-[#2b1b10]">
            Bu sertifika,
          </p>
        </div>

        <div className="absolute top-[33%] left-1/2 -translate-x-1/2 w-[72%] text-center">
          <h2 className="font-serif italic text-[58px] leading-tight text-[#2b1b10] font-semibold">
            {userName}
          </h2>
          <div className="w-[42%] h-[1.5px] bg-[#d6a943]/50 mx-auto mt-1" />
        </div>

        <div className="absolute top-[45%] left-1/2 -translate-x-1/2 w-[75%] text-center">
          <p className="font-serif text-[17px] text-[#1f160d]">
            isimli katılımcının,
          </p>
          <p className="mt-1 font-serif text-[20px] font-black text-[#a77a14]">
            SporThink Yapay Zeka Destekli Online Eğitim Platformu
          </p>
          <p className="font-serif text-[16px] text-[#1f160d]">
            kapsamında sunulan
          </p>
        </div>

        <div className="absolute top-[56%] left-1/2 -translate-x-1/2 w-[72%] text-center px-8">
          <h3
  className="font-serif italic text-[30px] leading-tight text-[#a77a14] font-semibold break-words"
>
  “{trainingName?.replace("Yol Haritası", "").trim()}”
</h3>
        </div>

        <div className="absolute top-[61%] left-1/2 -translate-x-1/2 w-[70%] text-center">
          <p className="font-serif text-[16px] leading-relaxed text-[#1f160d]">
            eğitimini üstün başarı ile tamamladığını ve<br />
            yüksek performans gösterdiğini belgelemek amacıyla verilmiştir.
          </p>
        </div>

        <div className="absolute left-[27%] bottom-[20%] text-center w-[190px]">
          <p className="font-serif text-[15px] font-bold text-[#2b1b10]">
            Başarı Puanı:
          </p>
          <p className="font-serif text-[26px] font-black text-[#2b1b10]">
            {score}
          </p>
        </div>

        <div className="absolute right-[22%] bottom-[20%] text-center w-[230px]">
          <p className="font-serif text-[15px] font-bold text-[#2b1b10]">
            Seviye:
          </p>
          <p className="font-serif text-[17px] leading-tight font-black text-[#a77a14] uppercase">
            {level}
          </p>
        </div>

        <div className="absolute left-[15%] bottom-[9%] text-left">
          <p className="font-serif text-[14px] font-bold text-[#2b1b10]">
            Tarih:
          </p>
          <p className="font-serif text-[16px] text-black font-medium">
            {date}
          </p>
        </div>

        <div className="absolute left-1/2 bottom-[7.4%] -translate-x-1/2 text-center w-[350px]">
          <p className="font-serif text-[13px] text-[#2b1b10] font-semibold">
            İnsan Kaynakları ve Eğitim Departmanı
          </p>
        </div>

        <div className="absolute right-[20%] bottom-[8%] text-center">
          <p className="font-serif text-[14px] font-bold text-[#2b1b10]">
            Yetkili İmza
          </p>
          <p className="font-serif italic text-[29px] text-[#1f160d] leading-none mt-2">
            SporThink
          </p>
        </div>
      </div>
    </div>
  );
}