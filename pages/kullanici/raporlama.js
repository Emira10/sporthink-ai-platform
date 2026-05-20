import { useState, useEffect, useRef } from "react";
import Head from "next/head";
import KullaniciLayout from "../../components/KullaniciLayout";
import { supabase } from "../../lib/supabaseClient";

// ─── DATA (unchanged) ────────────────────────────────────────────────────────
const PERIOD_DATA = {
  "7g":  { gorev: 2,  rozet: 0,  xp: 330,   tamamlama: 68, streak: 3,  xpData: [40,80,20,110,60,95,330],             labels: ["Pzt","Sal","Çar","Per","Cum","Cmt","Paz"], insight: "Bu hafta <b>3 gün üst üste</b> giriş yaptın. Serini korumaya devam et!" },
  "30g": { gorev: 14, rozet: 2,  xp: 1240,  tamamlama: 74, streak: 12, xpData: [120,180,95,210,175,240,220],          labels: ["H1","H2","H3","H4","H5","H6","H7"],       insight: "Bu ay kullanıcılar geçen aya kıyasla <b>%23 daha fazla</b> eğitim tamamladı. Pazartesi sabahları en yüksek aktivite günü." },
  "3a":  { gorev: 38, rozet: 5,  xp: 4800,  tamamlama: 81, streak: 28, xpData: [980,1200,980,1400,1050,1380,1120],    labels: ["Ara","Oca","Şub","Mar","Nis","May","Haz"], insight: "Son 3 ayda <b>4.800 XP</b> kazandın. Platform ortalamasının <b>%33 üzerindesin</b>." },
  "yil": { gorev: 91, rozet: 12, xp: 14200, tamamlama: 86, streak: 47, xpData: [1800,2100,1600,2400,2200,1900,2200],  labels: ["Oca","Şub","Mar","Nis","May","Haz","Tem"], insight: "Bu yıl toplam <b>91 görev</b> tamamladın ve <b>12 rozet</b> kazandın. Harika bir performans!" },
};

const LEADERS = [
  { name: "Test Kullanıcı", xp: 1240, pct: 100, av: "TK", bg: "#FAECE7", fg: "#993C1D", me: true },
  { name: "Ayşe Kaya",      xp: 1180, pct: 95,  av: "AK", bg: "#E6F1FB", fg: "#185FA5", me: false },
  { name: "Mehmet Demir",   xp: 1050, pct: 85,  av: "MD", bg: "#E1F5EE", fg: "#0F6E56", me: false },
  { name: "Selin Arslan",   xp: 980,  pct: 79,  av: "SA", bg: "#FAEEDA", fg: "#854F0B", me: false },
  { name: "Can Yılmaz",     xp: 870,  pct: 70,  av: "CY", bg: "#EEEDFE", fg: "#534AB7", me: false },
];

const TASKS = [
  { name: "SQL Temelleri", val: 90, color: "#D85A30" },
  { name: "Python Giriş",  val: 72, color: "#1D9E75" },
  { name: "İK Modülü",     val: 55, color: "#378ADD" },
  { name: "Veri Analizi",  val: 38, color: "#BA7517" },
  { name: "Liderlik",      val: 20, color: "#888780" },
];

const CATEGORIES = [
  { label: "SQL",              pct: 35, color: "#D85A30" },
  { label: "Python",           pct: 28, color: "#1D9E75" },
  { label: "İnsan Kaynakları", pct: 18, color: "#378ADD" },
  { label: "Diğer",            pct: 19, color: "#888780" },
];

const MONTHS = ["Oca","Şub","Mar","Nis","May","Haz","Tem","Ağu","Eyl","Eki","Kas","Ara"];
const HEAT_COLORS = ["transparent","#F5C4B3","#F0997B","#D85A30","#993C1D"];
const MEDALS = ["🥇","🥈","🥉","4","5"];

// ─── MAIN PAGE (unchanged logic) ─────────────────────────────────────────────
export default function Raporlama() {
  const [filter, setFilter] = useState("30g");
  const [reportStats, setReportStats] = useState(null);
  const [leaders, setLeaders] = useState([]);
  const [categoryStats, setCategoryStats] = useState([]);
  const [taskStats, setTaskStats] = useState([]);
  const [selectedKpi, setSelectedKpi] = useState(null);
  const d = reportStats || PERIOD_DATA[filter];

  const [heatCells, setHeatCells] = useState([]);

useEffect(() => {
  async function loadHeatmap() {
    const { data } = await supabase.auth.getUser();
    const userId = data?.user?.id;

    if (!userId) return;

    const res = await fetch(`/api/raporlar/heatmap?user_id=${userId}`);
    const json = await res.json();

    if (json.ok) {
      setHeatCells(json.days || []);
    }
  }

  loadHeatmap();
}, []);

    useEffect(() => {
  async function loadStats() {
    const { data } = await supabase.auth.getUser();
    const userId = data?.user?.id;

    if (!userId) return;

    const res = await fetch(`/api/raporlar/stats?user_id=${userId}&period=${filter}`);
    const json = await res.json();

    if (json.ok) {
      setReportStats(json.stats);
    }
  }

  loadStats();
}, [filter]);

useEffect(() => {
  async function loadLeaders() {
    const res = await fetch("/api/oyunlastirma/leaderboard");
    const json = await res.json();

    if (json.success) {
      setLeaders(json.leaderboard || []);
    }
  }

  loadLeaders();
}, []);

useEffect(() => {
  async function loadCategories() {
    const { data } = await supabase.auth.getUser();
    const userId = data?.user?.id;

    if (!userId) return;

    const res = await fetch(`/api/raporlar/categories?user_id=${userId}&period=${filter}`);
    const json = await res.json();

    if (json.ok) {
      setCategoryStats(json.categories || []);
    }
  }

  loadCategories();
}, [filter]);

useEffect(() => {
  async function loadTasks() {
    const { data } = await supabase.auth.getUser();
    const userId = data?.user?.id;

    if (!userId) return;

    const res = await fetch(`/api/raporlar/tasks?user_id=${userId}&period=${filter}`);
    const json = await res.json();

    if (json.ok) {
      setTaskStats(json.tasks || []);
    }
  }

  loadTasks();
}, [filter]);

  const kpis = [
  { key: "xp", label: "Toplam XP", value: d.xp.toLocaleString("tr"), sub: "▲ +23% büyüme", cls: "up" },
  { key: "tasks", label: "Tamamlanan Görev", value: d.gorev, sub: "aktif görevler", cls: "neutral" },
  { key: "completion", label: "Tamamlama Oranı", value: `${d.tamamlama}%`, sub: "platform ort. %61", cls: "up" },
  { key: "streak", label: "Aktif Serisi", value: `${d.streak} gün`, sub: "kişisel rekor: 47 gün", cls: "neutral" },
  { key: "badges", label: "Rozet", value: d.rozet, sub: "bu dönemde kazanıldı", cls: "neutral" },
  { key: "rank", label: "Genel Sıralama", value: d.rank || "—", sub: "tüm kullanıcılar içinde", cls: "up" },
];

function downloadCSV() {
  const rows = [
    ["Metrik", "Değer"],
    ["Toplam XP", d.xp],
    ["Tamamlanan Görev", d.gorev],
    ["Tamamlama Oranı", d.tamamlama + "%"],
    ["Aktif Seri", d.streak + " gün"],
    ["Rozet", d.rozet],
    ["Genel Sıralama", d.rank || "—"],
  ];

  const csv = rows.map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "sporthink-rapor.csv";
  a.click();

  URL.revokeObjectURL(url);
}

function downloadPDF() {
  document.body.classList.add("printing-report");

  setTimeout(() => {
    window.print();

    setTimeout(() => {
      document.body.classList.remove("printing-report");
    }, 500);
  }, 200);
}

async function shareReport() {
  await navigator.clipboard.writeText(window.location.href);
  alert("Rapor bağlantısı kopyalandı.");
}

function runAIAnalysis() {
  alert(`AI Analiz: Son 30 günde ${d.gorev} aktivite tamamladın ve ${d.xp} XP kazandın.`);
}

  return (
    <KullaniciLayout pageTitle="Raporlama">
      <Head><title>Raporlama — SporthINK</title></Head>

      <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">

        {/* ── Filter Row ── */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-rose-500 mb-1">SporthINK Kullanıcı Paneli</p>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Raporlama</h1>
          </div>
          <div className="flex gap-2 flex-wrap">
            {[["7g","7 Gün"],["30g","30 Gün"],["3a","3 Ay"],["yil","Bu Yıl"]].map(([k,l]) => (
              <button
                key={k}
                onClick={() => setFilter(k)}
                className={`text-xs px-4 py-2 rounded-full border font-bold transition-all duration-200 ${
                  filter === k
                    ? "bg-gradient-to-r from-rose-500 to-orange-500 text-white border-transparent shadow-lg shadow-rose-500/25"
                    : "border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800/80 hover:border-rose-300 dark:hover:border-rose-500/50"
                }`}
              >{l}</button>
            ))}
          </div>
        </div>

        {/* ── AI Insight ── */}
        <div className="flex items-start gap-4 p-5 rounded-2xl bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 dark:from-violet-950/40 dark:via-purple-950/40 dark:to-fuchsia-950/40 border border-violet-200/80 dark:border-violet-700/50 shadow-xl shadow-violet-200/30 dark:shadow-black/20">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25 shrink-0">
            <span className="text-white text-base">🧠</span>
          </div>
          <div>
  <p className="text-[10px] font-bold uppercase tracking-widest text-violet-600 dark:text-violet-400 mb-1">
    AI İçgörüsü
  </p>

  <p
    className="text-sm font-semibold text-slate-700 dark:text-slate-200 leading-relaxed"
    dangerouslySetInnerHTML={{ __html: d.insight }}
  />
</div>

<div className="flex flex-wrap gap-2 mt-4">

  <button
  onClick={() => alert("AI sistemi seni yüksek performanslı kullanıcı olarak analiz etti. Son aktivitelerin platform ortalamasının üzerinde.")}
  className="px-3 py-1.5 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/20 hover:scale-105 transition-all text-left"
>
    <p className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
      AI Durumu
    </p>
    <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300 mt-0.5">
      Yüksek Performans
    </p>
  </button>

  <button
  onClick={() => alert(`${d.gorev} görev tamamlandı. Kullanıcı aktivitesi son dönemde yükselişte.`)}
  className="px-3 py-1.5 rounded-xl bg-violet-500/10 dark:bg-violet-500/20 border border-violet-500/20 hover:scale-105 transition-all text-left"
>
    <p className="text-[10px] font-black uppercase tracking-wider text-violet-600 dark:text-violet-400">
      Aktivite
    </p>
    <p className="text-xs font-bold text-violet-700 dark:text-violet-300 mt-0.5">
      {d.gorev} görev tamamlandı
    </p>
  </button>

  <button
  onClick={() => alert("AI önerisi: Analiz görevleri ve takım aktiviteleri başarı oranını artırabilir.")}
  className="px-3 py-1.5 rounded-xl bg-rose-500/10 dark:bg-rose-500/20 border border-rose-500/20 hover:scale-105 transition-all text-left"
>
  <p className="text-[10px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-400">
    Öneri
  </p>

  <p className="text-xs font-bold text-rose-700 dark:text-rose-300 mt-0.5">
    AI analiz görevlerini artır
  </p>
</button>
</div>

</div>

        {/* ── KPI Grid ── */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {kpis.map((k) => (
            <button
  key={k.label}
  onClick={() => setSelectedKpi(k)}
  className="group text-left p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 shadow-lg shadow-slate-200/50 dark:shadow-black/20 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">{k.label}</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{k.value}</p>
              <p className={`text-[10px] mt-1 font-semibold ${k.cls === "up" ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 dark:text-slate-500"}`}>{k.sub}</p>
            </button>
          ))}
        </div>

        {selectedKpi && (
  <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-rose-200 dark:border-rose-500/30 shadow-xl">
    <div className="flex items-center justify-between mb-3">
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-rose-500">
          Detaylı KPI Analizi
        </p>
        <h3 className="text-lg font-black text-slate-900 dark:text-white">
          {selectedKpi.label}
        </h3>
      </div>

      <button
        onClick={() => setSelectedKpi(null)}
        className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 font-black"
      >
        ×
      </button>
    </div>

    <p className="text-3xl font-black text-slate-900 dark:text-white mb-2">
      {selectedKpi.value}
    </p>

    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
      {selectedKpi.key === "xp" &&
        "Bu değer, son 30 gün içinde tamamladığın quiz, analiz, görev ve iletişim aktivitelerinden kazanılan toplam XP miktarını gösterir."}

      {selectedKpi.key === "tasks" &&
        "Bu değer, user_activity_logs tablosunda kayıtlı tamamlanan gerçek aktivitelerin toplam sayısından hesaplanır."}

      {selectedKpi.key === "completion" &&
        "Tamamlama oranı, tamamlanan aktivitelerin hedeflenen görev sayısına göre otomatik hesaplanır."}

      {selectedKpi.key === "streak" &&
        "Aktif seri, farklı günlerde yapılan öğrenme aktivitelerine göre hesaplanır."}

      {selectedKpi.key === "badges" &&
        "Rozet sayısı, kazanılan toplam XP seviyesine göre otomatik değerlendirilir."}

      {selectedKpi.key === "rank" &&
        "Genel sıralama, leaderboard_view içindeki kullanıcı puanlarına göre hesaplanır."}
    </p>
  </div>
)}

        {/* ── Charts Row ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 shadow-lg">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4">📈 Haftalık XP Kazanımı</p>
            <XPBarChart data={d.xpData} labels={d.labels} />
          </div>
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 shadow-lg">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4">📚 Eğitim Kategorileri</p>
            <DonutChart categories={categoryStats.length ? categoryStats : CATEGORIES} />
          </div>
        </div>

        {/* ── Leaderboard + Progress ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 shadow-lg">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4">🏆 Liderlik Tablosu</p>
            {(leaders.length ? leaders.slice(0, 5) : LEADERS).map((l, i) => (
              <div key={l.name} className="flex items-center gap-3 py-2 border-b border-slate-100 dark:border-slate-700/50 last:border-0">
                <span className="text-sm font-black min-w-[20px]" style={{ color: ["#BA7517","#888780","#993C1D","#aaa","#aaa"][i] }}>
                  {MEDALS[i]}
                </span>
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                  style={{ background: l.bg, color: l.fg }}>{(l.name || l.student_name || "K").split(" ").map(x => x[0]).join("").slice(0,2)}</div>
                <span className={`flex-1 text-xs font-semibold flex items-center gap-2 ${l.me ? "text-rose-500 font-bold" : "text-slate-700 dark:text-slate-300"}`}>
                  {l.name || l.student_name}
                  {l.me && <span className="text-[9px] px-2 py-0.5 rounded-full bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-black">Sen</span>}
                </span>
                <div className="w-16 h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                  <div className="h-full rounded-full bg-rose-500" style={{ width: `${l.pct || Math.min(100, Number(l.points || l.xp || 0) / 10)}%` }} />
                </div>
                <span className="text-xs font-black text-rose-500 min-w-[64px] text-right">{Number(l.xp || l.points || 0).toLocaleString("tr")} XP</span>
              </div>
            ))}
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 shadow-lg">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4">🎯 Görev Tamamlama Oranları</p>
            {(taskStats.length ? taskStats : TASKS).map((t) => (
              <div key={t.name} className="mb-3">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-500 dark:text-slate-400">{t.name}</span>
                  <span className="font-black text-slate-900 dark:text-white">{t.val}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${t.val}%`, background: t.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Heatmap ── */}
<div className="p-5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 shadow-lg">
  <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
        📅 Yıllık Aktivite Haritası
      </p>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
        52 hafta × 7 gün — her kutu bir öğrenme gününü temsil eder.
      </p>
    </div>

    <div className="flex items-center gap-1.5">
      <span className="text-[10px] text-slate-400 dark:text-slate-500">Az</span>
      {[1, 2, 3, 4].map((l) => (
        <div
          key={l}
          className="w-3 h-3 rounded-sm"
          style={{ background: HEAT_COLORS[l] }}
        />
      ))}
      <span className="text-[10px] text-slate-400 dark:text-slate-500">Çok</span>
    </div>
  </div>

  <div className="overflow-x-auto pb-2">
    <div className="min-w-[760px]">
      <div className="grid grid-cols-[40px_1fr] gap-3">
        <div className="grid grid-rows-7 gap-1 pt-6">
          {["Pzt", "", "Çar", "", "Cum", "", "Paz"].map((d, i) => (
            <span
              key={i}
              className="text-[9px] text-slate-400 dark:text-slate-500 h-3.5 flex items-center"
            >
              {d}
            </span>
          ))}
        </div>

        <div>
          <div className="grid grid-cols-12 mb-2">
            {MONTHS.map((m) => (
              <span
                key={m}
                className="text-[9px] text-slate-400 dark:text-slate-500"
              >
                {m}
              </span>
            ))}
          </div>

          <div
            className="grid grid-flow-col grid-rows-7 gap-1"
            style={{ gridTemplateColumns: "repeat(52, minmax(0, 1fr))" }}
          >
            {heatCells.map((c) => (
              <div
                key={c.id}
                title={
  c.count > 0
    ? `${c.date} • ${c.count} aktivite • ${c.xp} XP`
    : `${c.date} • Aktivite yok`
}
                className="w-3.5 h-3.5 rounded-[4px] cursor-pointer hover:scale-125 hover:ring-2 hover:ring-rose-400/40 transition-all"
                style={{
                  background: HEAT_COLORS[c.level],
                  border: "1px solid rgba(148,163,184,0.18)",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

        {/* ── Export ── */}
<div className="flex gap-3 justify-end flex-wrap">
  <button
    onClick={downloadPDF}
    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all duration-200"
  >
    📄 PDF İndir
  </button>

  <button
    onClick={downloadCSV}
    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all duration-200"
  >
    📊 Excel Export
  </button>

  <button
    onClick={shareReport}
    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all duration-200"
  >
    🔗 Paylaş
  </button>

  <button
    onClick={runAIAnalysis}
    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 text-white text-xs font-bold shadow-lg shadow-rose-500/25 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
  >
    🧠 AI Analiz Yap
  </button>
</div>

      </div>

      <style jsx global>{`
  @media print {
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    body {
      background: white !important;
    }

    button {
      display: none !important;
    }

    .printing-report aside,
    .printing-report nav {
      display: none !important;
    }

    .printing-report main {
      margin: 0 !important;
      padding: 0 !important;
      width: 100% !important;
    }

    .printing-report .shadow-lg,
    .printing-report .shadow-xl,
    .printing-report .shadow-2xl {
      box-shadow: none !important;
    }

    @page {
      size: A4;
      margin: 12mm;
    }
  }
`}</style>

    </KullaniciLayout>
  );
}

// ─── XP BAR CHART (unchanged) ────────────────────────────────────────────────
function XPBarChart({ data, labels }) {
  const canvasRef = useRef(null);
  const chartRef  = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined" || !canvasRef.current) return;
    import("chart.js").then(({ Chart, registerables }) => {
      Chart.register(...registerables);
      if (chartRef.current) { chartRef.current.destroy(); }
      const maxVal = Math.max(...data);
      chartRef.current = new Chart(canvasRef.current, {
        type: "bar",
        data: {
          labels,
          datasets: [{
            label: "XP",
            data,
            backgroundColor: data.map((v) => v === maxVal ? "#D85A30" : "#F5C4B3"),
            borderRadius: 5,
            borderSkipped: false,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { display: false }, ticks: { font: { size: 11 }, color: "#888780" }, border: { display: false } },
            y: { grid: { color: "rgba(128,128,128,0.1)" }, ticks: { font: { size: 11 }, color: "#888780" }, border: { display: false } },
          },
        },
      });
    });
    return () => { chartRef.current?.destroy(); chartRef.current = null; };
  }, [data, labels]);

  return <div style={{ position: "relative", height: 160, width: "100%" }}><canvas ref={canvasRef} /></div>;
}

// ─── DONUT CHART (unchanged) ─────────────────────────────────────────────────
function DonutChart({ categories }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined" || !canvasRef.current) return;
    import("chart.js").then(({ Chart, registerables }) => {
      Chart.register(...registerables);
      const chart = new Chart(canvasRef.current, {
        type: "doughnut",
        data: {
          labels: categories.map((c) => c.label),
datasets: [{
  data: categories.map((c) => c.pct),
  backgroundColor: categories.map((c) => c.color),
            borderWidth: 2,
            borderColor: "transparent",
            hoverOffset: 6,
          }],
        },
        options: {
          responsive: false,
          cutout: "65%",
          plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx) => ` ${ctx.label}: ${ctx.parsed}%` } } },
        },
      });
      return () => chart.destroy();
    });
  }, []);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
      <canvas ref={canvasRef} width={110} height={110} />
      <div>
        {categories.map((c) => (
          <div key={c.label} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, color: "#5f5e5a", marginBottom: 7 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: c.color, flexShrink: 0, display: "inline-block" }} />
            {c.label} — {c.pct}%
          </div>
        ))}
      </div>
    </div>
  );
}