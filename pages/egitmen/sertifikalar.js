import { useEffect, useMemo, useState } from "react";
import EgitmenLayout from "../../components/egitmen/EgitmenLayout";

export default function EgitmenSertifikalar() {
  const [certs, setCerts] = useState([]);
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const res = await fetch("/api/certificates/list-all");
    const json = await res.json();

    if (json.ok) {
      setCerts(json.certificates || []);
    }
  }

  const filteredCerts = useMemo(() => {
    return certs.filter((c) => {
      const q = search.toLowerCase();

      const matchesSearch =
        String(c.user_id || "").toLowerCase().includes(q) ||
        String(c.training_name || "").toLowerCase().includes(q) ||
        String(c.level || "").toLowerCase().includes(q);

      const matchesLevel =
        levelFilter === "all" || c.level === levelFilter;

      return matchesSearch && matchesLevel;
    });
  }, [certs, search, levelFilter]);

  const total = certs.length;
  const altin = certs.filter((c) => c.level === "ALTIN SEVİYE").length;
  const avgScore =
    certs.length > 0
      ? Math.round(
          certs.reduce((sum, c) => {
            const num = parseInt(String(c.score || "0").replace("/100", ""));
            return sum + (isNaN(num) ? 0 : num);
          }, 0) / certs.length
        )
      : 0;

  return (
    <EgitmenLayout
      pageTitle="Sertifikalar"
      pageSubtitle="Katılımcı sertifikalarını görüntüle, takip et ve denetle"
    >
      {({ isDark }) => (
        <div className="space-y-8">
          <section
            className={`relative overflow-hidden rounded-[3rem] p-8 border ${
              isDark
                ? "bg-white/[0.04] border-white/10"
                : "bg-white border-zinc-200 shadow-xl"
            }`}
          >
            <div className="absolute -top-24 -right-24 w-80 h-80 bg-[#E61A21]/20 blur-[100px] rounded-full" />

            <div className="relative z-10">
              <p className="text-[#E61A21] text-[10px] font-black tracking-[0.4em] uppercase mb-3">
                SPORTHINK • SERTİFİKA DENETİM MERKEZİ
              </p>

              <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tight mb-3">
                Sertifika Takip Paneli
              </h2>

              <p className="text-sm font-bold text-zinc-500 max-w-2xl">
                Katılımcıların kazandığı sertifikaları görüntüle, filtrele ve
                eğitim başarı durumlarını takip et.
              </p>
            </div>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { icon: "🎓", label: "Toplam Sertifika", value: total },
              { icon: "🏆", label: "Altın Seviye", value: altin },
              { icon: "⭐", label: "Ortalama Puan", value: `${avgScore}/100` },
            ].map((item) => (
              <div
                key={item.label}
                className={`rounded-[2rem] p-6 border ${
                  isDark
                    ? "bg-white/[0.04] border-white/10"
                    : "bg-white border-zinc-200 shadow-lg"
                }`}
              >
                <div className="text-3xl mb-4">{item.icon}</div>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">
                  {item.label}
                </p>
                <p className="text-3xl font-black italic">{item.value}</p>
              </div>
            ))}
          </section>

          <section
            className={`rounded-[2rem] p-5 border flex flex-col md:flex-row gap-4 ${
              isDark
                ? "bg-white/[0.03] border-white/10"
                : "bg-white border-zinc-200 shadow-lg"
            }`}
          >
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Kullanıcı, eğitim veya seviye ara..."
              className={`flex-1 px-5 py-4 rounded-2xl outline-none text-sm font-bold ${
                isDark
                  ? "bg-black/30 border border-white/10 text-white placeholder:text-zinc-500"
                  : "bg-zinc-50 border border-zinc-200 text-zinc-900"
              }`}
            />

            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className={`px-5 py-4 rounded-2xl outline-none text-sm font-black ${
                isDark
                  ? "bg-black/30 border border-white/10 text-white"
                  : "bg-zinc-50 border border-zinc-200 text-zinc-900"
              }`}
            >
              <option value="all">Tüm Seviyeler</option>
              <option value="ALTIN SEVİYE">Altın Seviye</option>
              <option value="GÜMÜŞ SEVİYE">Gümüş Seviye</option>
              <option value="BRONZ SEVİYE">Bronz Seviye</option>
            </select>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredCerts.map((c) => (
              <div
                key={c.id}
                className={`relative overflow-hidden rounded-[2.5rem] border p-6 transition-all hover:scale-[1.02] ${
                  isDark
                    ? "bg-gradient-to-br from-white/10 to-white/[0.02] border-white/10 shadow-xl"
                    : "bg-white border-zinc-200 shadow-2xl"
                }`}
              >
                <div className="bg-white rounded-2xl p-2 mb-5">
                  <img
                    src="/certificates/success-level.png"
                    alt="certificate"
                    className="w-full h-auto rounded-xl"
                  />
                </div>

                <p className="text-xs text-zinc-500 font-bold mb-2">
                  👤 User ID: {c.user_id}
                </p>

                <h2
                  className={`font-black text-xl leading-tight mb-4 ${
                    isDark ? "text-white" : "text-zinc-900"
                  }`}
                >
                  {c.training_name || "Eğitim adı yok"}
                </h2>

                <p className="text-xs font-black mb-2">
  📌 Durum:
  <span
    className={`ml-2 px-3 py-1 rounded-full text-[10px] ${
      c.status === "approved"
        ? "bg-emerald-500/20 text-emerald-400"
        : c.status === "rejected"
        ? "bg-red-500/20 text-red-400"
        : "bg-yellow-500/20 text-yellow-400"
    }`}
  >
    {c.status || "Beklemede"}
  </span>
</p>

                <div className="flex items-center justify-between gap-3 mb-4">
                  <span className="px-4 py-2 rounded-full bg-yellow-400/10 text-yellow-500 text-xs font-black">
                    🏆 {c.level || "Seviye Yok"}
                  </span>

                  <span className="px-4 py-2 rounded-full bg-emerald-400/10 text-emerald-500 text-xs font-black">
                    ⭐ {c.score || "-"}
                  </span>
                </div>

                <p className="text-xs text-zinc-500 font-bold mb-5">
                  📅{" "}
                  {c.issued_at
                    ? new Date(c.issued_at).toLocaleDateString("tr-TR")
                    : "-"}
                </p>

                <button
                  type="button"
                  onClick={() =>
                    window.open(`/kullanici/certificate-view?id=${c.id}`, "_blank")
                  }
                  className="w-full py-4 rounded-2xl bg-[#E61A21] text-white font-black text-xs uppercase tracking-[0.2em] hover:bg-red-700 transition-all shadow-xl shadow-red-600/20"
                >
                  Sertifikayı Gör
                </button>
              </div>
            ))}
          </section>

          {filteredCerts.length === 0 && (
            <div
              className={`rounded-[2rem] p-10 text-center border ${
                isDark
                  ? "bg-white/[0.03] border-white/10"
                  : "bg-white border-zinc-200"
              }`}
            >
              <p className="text-4xl mb-3">📭</p>
              <h3 className="text-xl font-black">Sertifika bulunamadı</h3>
            </div>
          )}
        </div>
      )}
    </EgitmenLayout>
  );
}