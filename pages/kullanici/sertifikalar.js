import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import KullaniciLayout from "../../components/KullaniciLayout";

export default function KullaniciSertifikalar() {
  const [mounted, setMounted] = useState(false);  
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  useEffect(() => {
  setMounted(true);
  fetchCertificates();
}, []);

  async function fetchCertificates() {
    const userId = localStorage.getItem("userId");

    if (!userId) {
      setLoading(false);
      return;
    }

    const res = await fetch("/api/certificates/list-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId }),
    });

    const json = await res.json();

    if (json.ok) {
      setCertificates(json.certificates || []);
    }

    setLoading(false);
  }

  if (!mounted) {
  return null;
}

  return (
    <KullaniciLayout pageTitle="Sertifikalarım">
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {certificates.map((cert) => {
          const unlocked = cert.status === "unlocked";

          return (
            <div
              key={cert.id}
              className={`relative overflow-hidden rounded-[2rem] border p-6 transition-all ${
                unlocked
                  ? "bg-white text-black border-white shadow-2xl"
                  : "bg-white/5 text-white border-white/10"
              }`}
            >
                {/* 🔥 صورة الشهادة */}
  <img
  src={cert.image_url}
  alt={cert.title}
  className="w-full rounded-xl mb-4"
/>
              {!unlocked && (
                <div className="absolute inset-0 bg-black/45 backdrop-blur-[2px] z-10 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-5xl mb-3">🔒</div>
                    <p className="text-xs font-black tracking-[0.25em] uppercase text-white">
                      Kilitli Sertifika
                    </p>
                  </div>
                </div>
              )}

              <div className="relative z-0">
                <div className="flex items-center justify-between mb-8">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${
                      unlocked
                        ? "bg-[#E61A21] text-white shadow-xl shadow-red-600/30"
                        : "bg-white/10 text-white"
                    }`}
                  >
                    {cert.icon}
                  </div>

                  <span
                    className={`text-[10px] font-black tracking-widest uppercase px-3 py-2 rounded-full ${
                      unlocked
                        ? "bg-green-100 text-green-700"
                        : "bg-white/10 text-zinc-400"
                    }`}
                  >
                    {unlocked ? "Açıldı" : "Kilitli"}
                  </span>
                </div>

                <h2 className="text-2xl font-black italic uppercase mb-3">
                  {cert.title}
                </h2>

                <p
                  className={`text-sm leading-6 mb-6 ${
                    unlocked ? "text-zinc-600" : "text-zinc-400"
                  }`}
                >
                  {cert.description}
                </p>

                <div className="space-y-4 mb-6">
                  <div>
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2">
                      <span>İlerleme</span>
                      <span>{cert.progress}%</span>
                    </div>

                    <div
                      className={`h-2 rounded-full overflow-hidden ${
                        unlocked ? "bg-zinc-200" : "bg-white/10"
                      }`}
                    >
                      <div
                        className="h-full bg-[#E61A21] rounded-full"
                        style={{ width: `${cert.progress}%` }}
                      />
                    </div>
                  </div>

                  <div
                    className={`rounded-2xl p-4 border ${
                      unlocked
                        ? "border-zinc-200 bg-zinc-50"
                        : "border-white/10 bg-black/20"
                    }`}
                  >
                    <p className="text-[10px] font-black tracking-widest uppercase mb-1 opacity-70">
                      Gereklilik
                    </p>
                    <p className="text-sm font-bold">{cert.requirement}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div
                      className={`rounded-2xl p-4 ${
                        unlocked ? "bg-zinc-100" : "bg-white/5"
                      }`}
                    >
                      <p className="text-[9px] font-black uppercase tracking-widest opacity-60">
                        Başarı
                      </p>
                      <p className="text-xl font-black">{cert.score}</p>
                    </div>

                    <div
                      className={`rounded-2xl p-4 ${
                        unlocked ? "bg-zinc-100" : "bg-white/5"
                      }`}
                    >
                      <p className="text-[9px] font-black uppercase tracking-widest opacity-60">
                        Seviye
                      </p>
                      <p className="text-sm font-black">{cert.level}</p>
                    </div>
                  </div>
                </div>

                <button
  type="button"
  disabled={!unlocked}
  onClick={() => {
  if (unlocked) {
    localStorage.setItem("selectedCertificate", JSON.stringify(cert));
    router.push("/kullanici/certificate-view");
  }
}}
  className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all ${
    unlocked
      ? "bg-[#E61A21] text-white hover:scale-[1.02] shadow-xl shadow-red-600/25"
      : "bg-white/10 text-zinc-500 cursor-not-allowed"
  }`}
>
  {unlocked ? "Sertifikayı Görüntüle" : "Görev Tamamlanınca Açılır"}
</button>
              </div>
            </div>
          );
        })}
      </section>
    </KullaniciLayout>
  );
}