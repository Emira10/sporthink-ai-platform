import EgitmenLayout from "../../components/egitmen/EgitmenLayout";
import StatCard from "../../components/egitmen/StatCard";
import SectionBox from "../../components/egitmen/SectionBox";
import PageHeader from "../../components/egitmen/PageHeader";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
  IconBooks,
  IconRocket,
  IconUsers,
  IconTrophy,
  IconBell,
  IconAlertTriangle,
  IconCirclePlus,
  IconListDetails,
  IconReportAnalytics,
} from "@tabler/icons-react";

export default function EgitmenDashboard() {
  const router = useRouter();
  const [duyurular, setDuyurular] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [topStudents, setTopStudents] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [latestQuizResults, setLatestQuizResults] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [selectedStat, setSelectedStat] = useState(null);
  const [showQuizResults, setShowQuizResults] = useState(false);

  useEffect(() => {
  fetchEgitmenDuyurular();
  fetchDashboardData();
}, []);
  async function fetchEgitmenDuyurular() {
    const res = await fetch("/api/duyurular/role?role=egitmen&module=egitim");
    const json = await res.json();
    if (json.success) {
      setDuyurular(json.data || []);
    }
  }

  async function fetchDashboardData() {
  try {
    const res = await fetch("/api/egitmen/dashboard");
    const json = await res.json();

    if (json.success) {
      setDashboardStats(json.stats);
      setAlerts(json.alerts || []);
      setTopStudents(json.topStudents || []);
      setRecentActivities(json.recentActivities || []);
      setLatestQuizResults(json.latestQuizResults || []);
    }
  } catch (error) {
    console.error("Dashboard verileri alınamadı:", error);
  }
}

  const stats = [
  {
    key: "totalTrainings",
    title: "Toplam Eğitim",
    value: dashboardStats?.totalTrainings ?? "0",
    subtitle: "oluşturulan içerikler",
    details: "Sistemde kayıtlı olan tüm eğitim, video ve PDF içeriklerinin toplam sayısıdır.",
    icon: <IconBooks size={22} strokeWidth={1.75} />,
    accent: "#3B82F6",
  },
  {
    key: "activeTrainings",
    title: "Aktif Eğitim",
    value: dashboardStats?.activeTrainings ?? "0",
    subtitle: "yayında olan eğitimler",
    details: "Öğrenciler tarafından erişilebilir durumda olan aktif eğitimlerin sayısıdır.",
    icon: <IconRocket size={22} strokeWidth={1.75} />,
    accent: "#22C55E",
  },
  {
    key: "totalStudents",
    title: "Toplam Öğrenci",
    value: dashboardStats?.totalStudents ?? "0",
    subtitle: "katılımcı sayısı",
    details: "Platformda kullanıcı/öğrenci rolüyle kayıtlı olan katılımcıların toplam sayısıdır.",
    icon: <IconUsers size={22} strokeWidth={1.75} />,
    accent: "#F59E0B",
  },
  {
    key: "quizSuccessRate",
    title: "Quiz Başarı",
    value: `%${dashboardStats?.quizSuccessRate ?? 0}`,
    subtitle: "ortalama başarı oranı",
    details: "Tamamlanan quiz sonuçlarına göre hesaplanan genel başarı ortalamasıdır.",
    icon: <IconTrophy size={22} strokeWidth={1.75} />,
    accent: "#E61A21",
  },
];


  const alertColors = {
    danger: "#E61A21",
    warning: "#F59E0B",
    info: "#3B82F6",
  };

  const quickActions = [
    {
      title: "Yeni Eğitim Oluştur",
      desc: "Yeni kurs ekle ve yayın akışını başlat.",
      href: "/egitmen/yeni-egitim",
      icon: <IconCirclePlus size={20} strokeWidth={1.75} />,
      accent: "#22C55E",
    },
    {
      title: "Eğitimlerimi Gör",
      desc: "Tüm eğitimleri listele ve düzenle.",
      href: "/egitmen/egitimlerim",
      icon: <IconListDetails size={20} strokeWidth={1.75} />,
      accent: "#3B82F6",
    },
    {
      title: "Öğrenci Analizi",
      desc: "Öğrenme performansını detaylı incele.",
      href: "/egitmen/ogrenci-analizi",
      icon: <IconReportAnalytics size={20} strokeWidth={1.75} />,
      accent: "#F59E0B",
    },
  ];

  return (
    <EgitmenLayout
      pageTitle="Dashboard"
      pageSubtitle="Eğitmen performansı, içerikler ve öğrenme analitiği"
    >
      {({ isDark }) => (
        <>
          <PageHeader
            title="Genel Bakış"
            subtitle="eğitim, içerik ve öğrenci performansının hızlı özeti"
            actionLabel="Yeni Eğitim"
            onAction={() => router.push("/egitmen/yeni-egitim")}
            isDark={isDark}
          />

          {/* ── Stat Cards ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-6">
            {stats.map((item) => (
              <div
  key={item.title}
  onClick={() => setSelectedStat(selectedStat?.key === item.key ? null : item)}
  style={{ borderTop: `3px solid ${item.accent}` }}
  className={`rounded-[1.5rem] overflow-hidden cursor-pointer hover:-translate-y-1 transition-all duration-300 ${
    isDark ? "shadow-[0_0_0_1px_rgba(255,255,255,0.06)]" : "shadow-[0_0_0_1px_rgba(0,0,0,0.07)]"
  }`}
>
                <StatCard
                  title={item.title}
                  value={item.value}
                  subtitle={item.subtitle}
                  icon={item.icon}
                  isDark={isDark}
                />
              </div>
            ))}
          </div>

                    {selectedStat && (
            <div
              className={`mb-6 rounded-[2rem] border p-6 ${
                isDark
                  ? "border-white/10 bg-white/[0.03] text-white"
                  : "border-zinc-200 bg-white text-zinc-900 shadow-sm"
              }`}
            >
              <p
                className="text-[10px] font-black uppercase tracking-[0.25em]"
                style={{ color: selectedStat.accent }}
              >
                {selectedStat.title}
              </p>

              <h3 className="mt-2 text-3xl font-black italic">
                {selectedStat.value}
              </h3>

              <p
                className={`mt-3 text-sm font-bold ${
                  isDark ? "text-zinc-300" : "text-zinc-600"
                }`}
              >
                {selectedStat.details}
              </p>

              {selectedStat.key === "totalStudents" && (
  <div className="mt-6 space-y-3">
    {topStudents.map((student) => (
      <div
        key={student.kullanici_id}
        className={`rounded-2xl border p-4 flex items-center justify-between ${
          isDark
            ? "border-white/10 bg-white/[0.03]"
            : "border-zinc-200 bg-zinc-50"
        }`}
      >
        <div>
          <h4
            className={`font-black text-sm ${
              isDark ? "text-white" : "text-zinc-900"
            }`}
          >
            {student.ad} {student.soyad}
          </h4>

          <p
            className={`text-xs mt-1 ${
              isDark ? "text-zinc-400" : "text-zinc-500"
            }`}
          >
            {student.e_posta}
          </p>
        </div>

        <div
          className={`text-[10px] font-black uppercase px-3 py-2 rounded-xl ${
            isDark
              ? "bg-[#E61A21]/20 text-[#ff4d4f]"
              : "bg-red-50 text-[#E61A21]"
          }`}
        >
          Öğrenci
        </div>
      </div>
    ))}
  </div>
)}

            </div>
          )}

          {/* ── Duyuru ── */}
          {duyurular.length > 0 && (
            <div
              onClick={() => router.push("/egitmen/duyurular")}
              className={`mb-6 cursor-pointer rounded-[2rem] border p-5 transition-all duration-300 hover:-translate-y-1 ${
                isDark
                  ? "border-[#E61A21]/30 bg-[#E61A21]/10"
                  : "border-red-200 bg-red-50 shadow-lg"
              }`}
            >
              <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-[#E61A21]">
                <IconBell size={14} strokeWidth={2} aria-hidden="true" />
                Yeni Yönetici Duyurusu
              </p>
              <h3
                className={`mt-2 text-xl font-black italic uppercase ${
                  isDark ? "text-white" : "text-zinc-900"
                }`}
              >
                {duyurular[0].title}
              </h3>
              <p
                className={`mt-2 text-sm font-bold ${
                  isDark ? "text-zinc-300" : "text-zinc-600"
                }`}
              >
                {duyurular[0].content}
              </p>
            </div>
          )}

          {/* ── Bottom Grid ── */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

            {/* Quick Actions */}
            <div className="xl:col-span-2">
              <SectionBox
                title="Hızlı Erişim"
                subtitle="eğitmen panelinde en sık kullanılan işlemler"
                isDark={isDark}
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {quickActions.map((action) => (
                    <button
                      key={action.title}
                      onClick={() => router.push(action.href)}
                      style={{
                        borderLeft: `3px solid ${action.accent}`,
                      }}
                      className={`group text-left rounded-[1.5rem] border-y border-r transition-all duration-300 p-5 hover:-translate-y-1 ${
                        isDark
                          ? "border-white/5 bg-white/[0.02] hover:bg-white/[0.05]"
                          : "border-zinc-200 bg-white hover:bg-zinc-50 shadow-sm hover:shadow-md"
                      }`}
                    >
                      <span
                        style={{ color: action.accent }}
                        className="mb-3 block"
                        aria-hidden="true"
                      >
                        {action.icon}
                      </span>
                      <h4
                        className={`text-sm font-black uppercase italic ${
                          isDark ? "text-white" : "text-zinc-900"
                        }`}
                      >
                        {action.title}
                      </h4>
                      <p
                        className={`mt-2 text-[10px] font-bold uppercase tracking-[0.15em] leading-5 ${
                          isDark ? "text-zinc-500" : "text-zinc-500"
                        }`}
                      >
                        {action.desc}
                      </p>
                    </button>
                  ))}
                </div>
              </SectionBox>
            </div>

            {/* Alerts */}
            <div>
              <SectionBox
                title="Uyarılar"
                subtitle="aksiyon gerektiren noktalar"
                isDark={isDark}
              >
                
                <div className="space-y-3">
                  {alerts.map((alert, index) => (
                    <div
                      key={index}
                      style={{
                        borderLeft: `3px solid ${alertColors[alert.level]}`,
                      }}
                      className={`rounded-r-[1rem] rounded-l-sm border-y border-r p-4 transition-all ${
                        isDark
                          ? "border-white/5 bg-white/[0.02]"
                          : "border-zinc-200 bg-white shadow-sm"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <IconAlertTriangle
                          size={14}
                          strokeWidth={2}
                          style={{ color: alertColors[alert.level] }}
                          className="mt-[2px] shrink-0"
                          aria-hidden="true"
                        />
                        <p
                          className={`text-[11px] font-bold uppercase tracking-[0.1em] leading-5 ${
                            isDark ? "text-zinc-300" : "text-zinc-700"
                          }`}
                        >
                          {alert.text}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </SectionBox>
            </div>

          </div>

          <div className="mt-6">
  <SectionBox
  title="Son Sınav Sonuçları"
  subtitle="öğrencilerin en güncel sınav performansları"
  isDark={isDark}
>
  <button
    type="button"
    onClick={() => setShowQuizResults(!showQuizResults)}
    className={`mb-5 px-5 py-3 rounded-2xl font-black uppercase tracking-widest text-xs transition-all ${
      isDark
        ? "bg-white/5 hover:bg-white/10 text-white"
        : "bg-zinc-100 hover:bg-zinc-200 text-zinc-900"
    }`}
  >
    {showQuizResults ? "Sonuçları Gizle" : "Sonuçları Göster"}
  </button>

  {showQuizResults && (
    <div className="space-y-3">
      {latestQuizResults.length === 0 ? (
        <p className={`text-sm font-bold ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>
          Henüz sınav sonucu bulunmuyor.
        </p>
      ) : (
        latestQuizResults.map((result) => (
          <div
            key={result.id}
            className={`rounded-2xl border p-4 flex items-center justify-between gap-4 ${
              isDark
                ? "border-white/10 bg-white/[0.03]"
                : "border-zinc-200 bg-zinc-50"
            }`}
          >
            <div>
              <p className={`font-black text-sm ${isDark ? "text-white" : "text-zinc-900"}`}>
                {result.student}
              </p>
              <p className={`text-[11px] mt-1 font-bold ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>
                {result.exam} • {result.type}
              </p>
            </div>

            <div
              className={`text-sm font-black px-4 py-2 rounded-xl ${
                Number(result.score) >= 70
                  ? "bg-green-500/10 text-green-500"
                  : "bg-red-500/10 text-[#E61A21]"
              }`}
            >
              %{result.score}
            </div>
          </div>
        ))
      )}
    </div>
  )}
</SectionBox>
</div>

          <div className="mt-6">
  <SectionBox
    title="Canlı Aktivite Akışı"
    subtitle="platform üzerindeki son hareketler"
    isDark={isDark}
  >
    <div className="space-y-3">
      {recentActivities.map((activity, index) => (
        <div
          key={index}
          className={`rounded-2xl border p-4 flex items-center justify-between ${
            isDark
              ? "border-white/10 bg-white/[0.03]"
              : "border-zinc-200 bg-zinc-50"
          }`}
        >
          <div>
  <p
    className={`font-black text-sm leading-6 ${
      isDark ? "text-zinc-100" : "text-zinc-900"
    }`}
  >
    {activity.activity_text || activity.text}
  </p>

  <p
    className={`text-[11px] mt-1 ${
      isDark ? "text-zinc-500" : "text-zinc-400"
    }`}
  >
    Az önce gerçekleşti
  </p>
</div>

          <div
            className={`text-[10px] font-black uppercase px-3 py-2 rounded-xl ${
              isDark
                ? "bg-[#E61A21]/20 text-[#ff4d4f]"
                : "bg-red-50 text-[#E61A21]"
            }`}
          >
            LIVE
          </div>
        </div>
      ))}
    </div>
  </SectionBox>
</div>

        </>
      )}
    </EgitmenLayout>
  );
}