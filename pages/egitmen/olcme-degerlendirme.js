import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import EgitmenLayout from "../../components/egitmen/EgitmenLayout";
import {
  IconClipboardList,
  IconMessageDots,
  IconMedal,
  IconHelpCircle,
  IconPlus,
  IconChevronRight,
  IconTarget,
} from "@tabler/icons-react";



export default function OlcmeDegerlendirme() {
  const router = useRouter();

  const [stats, setStats] = useState({
  examsCount: 0,
  surveysCount: 0,
  resultsCount: 0,
  questionsCount: 0,
  averageScore: 0,
});

useEffect(() => {
  fetchOlcmeStats();
}, []);

async function fetchOlcmeStats() {
  const res = await fetch("/api/egitmen/olcme-dashboard");
  const json = await res.json();

  if (json.ok) {
    setStats(json.stats);
  }
}

const cards = [
  {
    title: "Online Sınavlar",
    desc: "Kapsamlı sınav oluştur, düzenle ve yönet.",
    icon: IconClipboardList,
    accent: "#E61A21",
    path: "/egitmen/sinavlar",
    stat: `${stats.examsCount} Sınav`,
  },
  {
    title: "Eğitim Sonrası Anketler",
    desc: "Eğitimlerden sonra geri bildirim topla.",
    icon: IconMessageDots,
    accent: "#3B82F6",
    path: "/egitmen/anketler",
    stat: `${stats.surveysCount} Anket`,
  },
  {
    title: "Başarı Puan Hesaplama",
    desc: "Öğrenci başarı durumlarını ve puanlarını takip et.",
    icon: IconMedal,
    accent: "#F59E0B",
    path: "/egitmen/sinav-sonuclari",
    stat: `%${stats.averageScore} Ortalama`,
  },
  {
    title: "Sınav Soruları",
    desc: "Sınavlara soru ekle ve cevapları belirle.",
    icon: IconHelpCircle,
    accent: "#22C55E",
    path: "/egitmen/sinav-sorulari",
    stat: `${stats.questionsCount} Soru`,
  },
];

  return (
    <EgitmenLayout
      pageTitle="Ölçme & Değerlendirme"
      pageSubtitle="Online sınavlar, anketler ve başarı puanı yönetimi"
    >
      {({ isDark }) => (
        <div className="space-y-6">

          {/* ── Hero banner ── */}
          <div
            style={{ borderTop: "3px solid #E61A21" }}
            className={`rounded-[1.5rem] p-7 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 ${
              isDark
                ? "bg-white/[0.02] shadow-[0_0_0_1px_rgba(255,255,255,0.06)]"
                : "bg-white shadow-[0_2px_16px_rgba(0,0,0,0.07)]"
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#E61A21]/10 flex items-center justify-center shrink-0">
                <IconTarget size={24} strokeWidth={1.75} className="text-[#E61A21]" aria-hidden="true" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#E61A21] mb-1">
                  SporThink Ölçme Merkezi
                </p>
                <h2 className={`text-2xl md:text-3xl font-black italic uppercase leading-tight ${
                  isDark ? "text-white" : "text-zinc-900"
                }`}>
                  Kapsamlı Değerlendirme Paneli
                </h2>
                <p className={`mt-2 text-xs font-bold uppercase tracking-widest ${
                  isDark ? "text-zinc-500" : "text-zinc-400"
                }`}>
                  Sınav oluştur, anket yönet ve öğrenci başarı durumlarını takip et.
                </p>
              </div>
            </div>

            <button
              onClick={() => router.push("/egitmen/sinavlar")}
              className="flex items-center gap-2 bg-[#E61A21] text-white px-6 py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all duration-200 hover:-translate-y-[2px] hover:shadow-xl hover:shadow-red-900/30 shrink-0"
            >
              <IconPlus size={16} strokeWidth={2.5} aria-hidden="true" />
              Yeni Sınav
            </button>
          </div>

          {/* ── Cards grid ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
            {cards.map((card) => {
              const Icon = card.icon;
              return (
                <button
                  key={card.title}
                  onClick={() => router.push(card.path)}
                  style={{ borderTop: `3px solid ${card.accent}` }}
                  className={`group relative text-left rounded-[1.5rem] p-6 transition-all duration-300 hover:-translate-y-1 ${
                    isDark
                      ? "bg-white/[0.02] shadow-[0_0_0_1px_rgba(255,255,255,0.06)] hover:bg-white/[0.05] hover:shadow-[0_0_0_1px_rgba(255,255,255,0.1)]"
                      : "bg-white shadow-[0_2px_16px_rgba(0,0,0,0.07)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.12)]"
                  }`}
                >
                  {/* Icon box */}
                  <div
                    style={{ backgroundColor: `${card.accent}15` }}
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110"
                  >
                    <Icon
                      size={22}
                      strokeWidth={1.75}
                      style={{ color: card.accent }}
                      aria-hidden="true"
                    />
                  </div>

                  {/* Stat pill */}
                  <div className="mb-4">
                    <span
                      style={{ color: card.accent, backgroundColor: `${card.accent}12` }}
                      className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg"
                    >
                      {card.stat}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className={`text-base font-black italic uppercase leading-tight mb-3 ${
                    isDark ? "text-white" : "text-zinc-900"
                  }`}>
                    {card.title}
                  </h3>

                  {/* Desc */}
                  <p className={`text-[12px] font-semibold leading-relaxed ${
                    isDark ? "text-zinc-500" : "text-zinc-500"
                  }`}>
                    {card.desc}
                  </p>

                  {/* CTA */}
                  <div
                    style={{ color: card.accent }}
                    className="mt-6 flex items-center gap-1 text-[10px] font-black uppercase tracking-widest transition-all duration-200 group-hover:gap-2"
                  >
                    Yönet
                    <IconChevronRight
                      size={13}
                      strokeWidth={2.5}
                      className="transition-transform duration-200 group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </div>

                  {/* Bottom accent line on hover */}
                  <div
                    style={{ backgroundColor: card.accent }}
                    className="absolute bottom-0 left-6 right-6 h-[2px] rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300"
                  />
                </button>
              );
            })}
          </div>

        </div>
      )}
    </EgitmenLayout>
  );
}