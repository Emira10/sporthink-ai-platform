import { useEffect, useState, useMemo } from "react";
import EgitmenLayout from "../../components/egitmen/EgitmenLayout";
import { supabase } from "../../lib/supabaseClient";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Cell,
} from "recharts";
import {
  IconSearch,
  IconFilter,
  IconLoader2,
  IconChartBar,
  IconUsers,
  IconTrophy,
  IconTargetArrow,
  IconTrendingUp,
  IconTrendingDown,
  IconMinus,
  IconUser,
  IconForms,
  IconCheck,
  IconX,
} from "@tabler/icons-react";

// ── helpers ──────────────────────────────────────────────────────────
const inputCls = (isDark) =>
  `w-full rounded-xl px-4 py-3 border outline-none text-sm font-semibold transition-all duration-200
  ${isDark
    ? "bg-white/[0.03] border-white/10 text-white placeholder:text-zinc-600 focus:border-[#E61A21]/50 focus:bg-white/[0.06]"
    : "bg-zinc-50 border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus:border-[#E61A21]/50 focus:bg-white"}`;

const selectCls = (isDark) =>
  `w-full rounded-xl px-4 py-3 border outline-none text-sm font-semibold transition-all duration-200
  ${isDark
    ? "bg-white/[0.03] border-white/10 text-white focus:border-[#E61A21]/50"
    : "bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-[#E61A21]/50"}`;

function scoreColor(pct) {
  if (pct >= 80) return "#22C55E";
  if (pct >= 60) return "#F59E0B";
  return "#E61A21";
}

function ScoreRing({ pct, size = 52, stroke = 5 }) {
  const r   = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const fill = (pct / 100) * circ;
  const color = scoreColor(pct);
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke="currentColor" strokeWidth={stroke} className="text-zinc-200/30" />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={stroke}
        strokeDasharray={`${fill} ${circ}`}
        strokeLinecap="round"
        style={{ transition: "stroke-dasharray 0.6s ease" }} />
    </svg>
  );
}

// ── custom tooltip ────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label, isDark }) {
  if (!active || !payload?.length) return null;

  const item = payload[0]?.payload;

  return (
    <div className={`rounded-xl px-4 py-3 shadow-2xl border text-sm min-w-[240px] ${
      isDark
        ? "bg-[#1a1b18] border-white/10 text-white"
        : "bg-white border-zinc-200 text-zinc-900"
    }`}>
      <p className="font-black text-[11px] uppercase tracking-widest mb-2 text-zinc-500">
  {item.quiz_title}
</p>

      <p className="font-black text-base mb-2">
        Ortalama Başarı: %{item.avg}
      </p>

      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">
        Öğrenci Sonuçları
      </p>

      <div className="space-y-1 max-h-40 overflow-y-auto">
        {(item.students || []).slice(0, 8).map((s, i) => (
          <div key={i} className="flex items-center justify-between gap-3 text-xs">
            <span className="font-bold truncate">{s.name}</span>
            <span className={s.percent >= 60 ? "text-green-500 font-black" : "text-red-500 font-black"}>
              %{s.percent} · {s.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function QuizSonuclariPage() {
  // ── state — كودك الأصلي ──
  const [results,      setResults]      = useState([]);
  const [filtered,     setFiltered]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState("");
  const [selectedQuiz, setSelectedQuiz] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedStat, setSelectedStat] = useState(null);
  const [assessmentCatalog, setAssessmentCatalog] = useState([]);

  useEffect(() => { fetchResults(); }, []);
  useEffect(() => {
  filterData();
}, [search, selectedQuiz, selectedType, results]);

  // ── fetchResults — أصلي ──
  async function fetchResults() {
  setLoading(true);
  try {
    const res = await fetch("/api/egitmen/assessment-results");
    const json = await res.json();

    if (!json.ok) {
      alert(json.message || "Sonuçlar alınamadı!");
      return;
    }

    // هنا استلمنا البيانات الموحدة الجاهزة من الـ API مباشرة
    // لا حاجة لعمل map يدوي هنا لأن الـ API قام بالمهمة
    setResults(json.results || []);
    setAssessmentCatalog(json.assessments || []);
    
  } catch (error) {
    console.error("Fetch error:", error);
    alert("Bir hata oluştu!");
  } finally {
    setLoading(false);
  }
}

  // ── filterData — أصلي ──
  function filterData() {
  let data = [...results];

  if (selectedQuiz !== "all") {
    data = data.filter((r) => r.quiz_id === selectedQuiz);
  }

  if (selectedType !== "all") {
    data = data.filter((r) => r.assessment_type === selectedType);
  }

  if (search) {
    data = data.filter((r) =>
      r.student_name.toLowerCase().includes(search.toLowerCase())
    );
  }

  setFiltered(data);
}

  // ── chart data — أصلي ──
  // ── chart data — النسخة الاحترافية النهائية ──
  const chartData = useMemo(() => {
    const grouped = {};


filtered.reduce((acc, item) => {
      // نستخدم quiz_title الموحد اللي الـ API نظفه أصلاً
      const key = `${item.assessment_label} • ${item.quiz_title}`;

      if (!acc[key]) {
        acc[key] = {
          quiz_title: key, 
          total: 0,
          count: 0,
          students: [],
        };
      }

      acc[key].total += Number(item.percent || 0);
      acc[key].count += 1;

      acc[key].students.push({
        // تأكدي إن الحقل اسمه student_name عشان ما يطلع الإيميل
        name: item.student_name || item.user_id, 
        percent: Number(item.percent || 0),
        score: item.score,
        total_questions: item.total_questions,
        status: item.passed ? "Geçti" : "Kaldı",
      });

      return acc;
    }, grouped);

    if (!Object.values(grouped).length) {
  return [];
}

    return Object.values(grouped).map((d) => ({
  ...d,
  short_title: d.quiz_title
  .split("•")
  .pop()
  .trim()
  .split(" ")
  .filter(Boolean)
  .slice(0, 2)
  .map((w) => w[0]?.toUpperCase())
  .join(""),
  avg: d.count > 0 ? Math.round(d.total / d.count) : 0,
}));
  }, [filtered, assessmentCatalog, selectedType]);

  // ── new stats ──────────────────────────────────────────────────────
  const stats = useMemo(() => {
    if (!filtered.length) return { total: 0, passed: 0, failed: 0, avgPct: 0 };
    const total  = filtered.length;
    const passed = filtered.filter((r) => r.passed).length;
    const avgPct = Math.round(
  filtered.reduce((acc, r) => acc + Number(r.percent || 0), 0) / total
);
    return { total, passed, failed: total - passed, avgPct };
  }, [filtered]);

  function exportCSV() {
  const rows = filtered.map((r) => ({
    Ogrenci: r.student_name,
    Tur: r.assessment_label,
    Degerlendirme: r.quiz_title,
    Puan: r.score,
    Toplam: r.total_questions,
    Yuzde: r.percent,
    Durum: r.passed ? "Geçti" : "Kaldı",
    Tarih: r.created_at,
  }));

  const header = Object.keys(rows[0] || {}).join(",");
  const body = rows.map((row) =>
    Object.values(row).map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")
  ).join("\n");

  const blob = new Blob([header + "\n" + body], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "quiz-sonuclari.csv";
  a.click();

  URL.revokeObjectURL(url);
}

  return (
    <EgitmenLayout
      pageTitle="Quiz Sonuçları"
      pageSubtitle="Akademik Performans Analizi"
    >
      {({ isDark }) => (
        <>
          {/* ══════════════════════════════════════
              ① STATS BAR — جديد
          ══════════════════════════════════════ */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            {[
  { key: "all", label: "Toplam Girişim", value: stats.total, icon: IconUsers, accent: "#E61A21" },
  { key: "passed", label: "Geçti", value: stats.passed, icon: IconCheck, accent: "#22C55E" },
  { key: "failed", label: "Kaldı", value: stats.failed, icon: IconX, accent: "#F59E0B" },
  { key: "avg", label: "Ortalama", value: `%${stats.avgPct}`, icon: IconTargetArrow, accent: "#3B82F6" },
].map(({ key, label, value, icon: Icon, accent }) => (
              <div key={label}
                onClick={() => setSelectedStat(key)}
                style={{ borderLeft: `3px solid ${accent}` }}
                className={`cursor-pointer rounded-[1rem] px-4 py-4 transition-all ${
                  isDark
                    ? "bg-white/[0.02] shadow-[0_0_0_1px_rgba(255,255,255,0.06)]"
                    : "bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)]"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon size={13} strokeWidth={2} style={{ color: accent }} aria-hidden="true" />
                  <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500">{label}</p>
                </div>
                <p className={`text-2xl font-black tabular-nums ${isDark ? "text-white" : "text-zinc-900"}`}>
                  {value}
                </p>
              </div>
            ))}
          </div>

          {selectedStat && (
  <div className={`mb-6 rounded-[1.5rem] p-5 ${
    isDark
      ? "bg-white/[0.02] shadow-[0_0_0_1px_rgba(255,255,255,0.06)]"
      : "bg-white shadow-[0_2px_16px_rgba(0,0,0,0.07)]"
  }`}>
    <div className="flex items-center justify-between mb-4">
      <h3 className={`text-lg font-black ${isDark ? "text-white" : "text-zinc-900"}`}>
        Detaylı Liste
      </h3>

      <button
        onClick={() => setSelectedStat(null)}
        className="text-xs font-black text-red-500"
      >
        Kapat
      </button>
    </div>

    <div className="space-y-3">
      {filtered
        .filter((r) => {
          if (selectedStat === "passed") return r.passed;
          if (selectedStat === "failed") return !r.passed;
          return true;
        })
        .map((r) => (
          <div
            key={r.id}
            className={`flex items-center justify-between rounded-xl px-4 py-3 ${
              isDark ? "bg-white/[0.03]" : "bg-zinc-50"
            }`}
          >
            <div>
              <p className={`font-black ${isDark ? "text-white" : "text-zinc-900"}`}>
                {r.student_name}
              </p>

              <div className="flex items-center gap-2 mt-0.5">
  <span className="px-1.5 py-0.5 bg-red-500/10 text-red-500 text-[9px] font-black uppercase rounded">
    {r.assessment_label}
  </span>
  <span className="text-[10px] font-bold text-zinc-500 uppercase">
    {r.quiz_title}
  </span>
</div>
            </div>

            <div className="text-right">
              <p className={`font-black ${r.passed ? "text-green-500" : "text-red-500"}`}>
                %{r.percent}
              </p>

              <p className="text-xs text-zinc-500">
                {r.score}/{r.total_questions}
              </p>
            </div>
          </div>
        ))}
    </div>
  </div>
)}

          {/* ══════════════════════════════════════
              ② FILTERS
          ══════════════════════════════════════ */}
          <div className={`rounded-[1.5rem] p-5 mb-6 ${
            isDark
              ? "bg-white/[0.02] shadow-[0_0_0_1px_rgba(255,255,255,0.06)]"
              : "bg-white shadow-[0_2px_16px_rgba(0,0,0,0.07)]"
          }`}>

              <div className="flex flex-col xl:flex-row gap-3 items-stretch">
  <button
    onClick={exportCSV}
    className="px-5 py-3 rounded-xl bg-green-500/10 text-green-600 font-black text-xs uppercase tracking-widest hover:bg-green-500/20 whitespace-nowrap"
  >
    Excel / CSV Dışa Aktar
  </button>

  <div className="relative flex-1">
    <IconSearch size={15} strokeWidth={2}
      className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? "text-zinc-500" : "text-zinc-400"}`}
      aria-hidden="true"
    />
    <input
      placeholder="Öğrenci ara..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className={`${inputCls(isDark)} pl-10`}
    />
  </div>

  <div className="relative xl:w-64">
    <IconFilter size={15} strokeWidth={2}
      className={`absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none ${isDark ? "text-zinc-500" : "text-zinc-400"}`}
      aria-hidden="true"
    />
    <select
      value={selectedQuiz}
      onChange={(e) => setSelectedQuiz(e.target.value)}
      className={`${selectCls(isDark)} pl-10`}
    >
      <option value="all">Tüm Quizler</option>
      {[...new Set(results.map((r) => r.quiz_id))].map((id) => (
        <option key={id} value={id}>
          {results.find((r) => r.quiz_id === id)?.quiz_title}
        </option>
      ))}
    </select>
  </div>

  <div className="relative xl:w-56">
    <select
      value={selectedType}
      onChange={(e) => setSelectedType(e.target.value)}
      className={selectCls(isDark)}
    >
      <option value="all">Tüm Türler</option>
      <option value="quiz">Quiz</option>
      <option value="final_exam">Final Sınavı</option>
      <option value="ai_exam">AI Sınav</option>
    </select>
  </div>
</div>
          </div>

          {/* ══════════════════════════════════════
              ③ CHART — enterprise upgrade
          ══════════════════════════════════════ */}
          <div
            style={{ borderTop: "3px solid #3B82F6" }}
            className={`rounded-[1.5rem] p-6 mb-6 ${
              isDark
                ? "bg-white/[0.02] shadow-[0_0_0_1px_rgba(255,255,255,0.06)]"
                : "bg-white shadow-[0_2px_16px_rgba(0,0,0,0.07)]"
            }`}
          >
            {/* Chart header */}
            <div className="flex items-center gap-3 mb-6">
              <span className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <IconChartBar size={16} strokeWidth={1.75} className="text-blue-500" aria-hidden="true" />
              </span>
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-500">
                  Performans Grafiği
                </p>
                <h3 className={`text-sm font-black italic uppercase ${isDark ? "text-white" : "text-zinc-900"}`}>
                  Değerlendirme Başına Ortalama Başarı
                </h3>
              </div>
              {chartData.length > 0 && (
                <div className="ml-auto flex items-center gap-4">
                  {[
                    { label: "İyi ≥80%",   color: "#22C55E" },
                    { label: "Orta ≥60%",  color: "#F59E0B" },
                    { label: "Düşük <60%", color: "#E61A21" },
                  ].map(({ label, color }) => (
                    <div key={label} className="flex items-center gap-1.5">
                      <span style={{ backgroundColor: color }} className="w-2 h-2 rounded-full" />
                      <span className="text-[10px] font-bold text-zinc-500">{label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {chartData.length === 0 ? (
              <div className={`flex items-center justify-center py-16 rounded-xl border-2 border-dashed ${
                isDark ? "border-white/[0.06]" : "border-zinc-200"
              }`}>
                <p className={`text-xs font-bold ${isDark ? "text-zinc-600" : "text-zinc-300"}`}>
                  Gösterilecek veri yok
                </p>
              </div>
            ) : (
              <div className="h-[340px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData || []} margin={{ top: 10, right: 10, bottom: 20, left: 0 }}
                    barCategoryGap="35%">
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={isDark ? "rgba(255,255,255,0.04)" : "#f1f1f1"}
                      vertical={false}
                    />
                    <XAxis
  dataKey="short_title"
  tick={{
    fill: isDark ? "#71717a" : "#9ca3af",
    fontSize: 11,
    fontWeight: 900,
  }}
  axisLine={false}
  tickLine={false}
  interval={0}
  height={35}
/>
                    <YAxis
                      tick={{ fill: isDark ? "#71717a" : "#9ca3af", fontSize: 11, fontWeight: 700 }}
                      axisLine={false} tickLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)", radius: 8 }}
                      content={<CustomTooltip isDark={isDark} />}
                    />
                    <Bar dataKey="avg" radius={[8, 8, 0, 0]} maxBarSize={56}>
                      {chartData.map((entry, i) => (
  <Cell
    key={i}
    fill={scoreColor(entry.avg)}
    fillOpacity={0.85}
  />
))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* ══════════════════════════════════════
              ④ RESULTS LIST
          ══════════════════════════════════════ */}
          {loading ? (
            <div className="flex items-center justify-center gap-3 py-20">
              <IconLoader2 size={22} strokeWidth={1.75} className="animate-spin text-[#E61A21]" aria-hidden="true" />
              <span className={`text-sm font-bold ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>
                Yükleniyor...
              </span>
            </div>
          ) : filtered.length === 0 ? (
            <div className={`rounded-[1.5rem] p-12 text-center ${
              isDark
                ? "bg-white/[0.02] shadow-[0_0_0_1px_rgba(255,255,255,0.06)]"
                : "bg-white shadow-[0_2px_16px_rgba(0,0,0,0.07)]"
            }`}>
              <IconForms size={40} strokeWidth={1} className="mx-auto mb-3 text-zinc-300" aria-hidden="true" />
              <p className={`text-sm font-bold ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>
                Sonuç bulunamadı
              </p>
            </div>
          ) : (
            <div
              style={{ borderTop: "3px solid #E61A21" }}
              className={`rounded-[1.5rem] overflow-hidden ${
                isDark
                  ? "bg-white/[0.02] shadow-[0_0_0_1px_rgba(255,255,255,0.06)]"
                  : "bg-white shadow-[0_2px_16px_rgba(0,0,0,0.07)]"
              }`}
            >
              {/* List header */}
              <div className="flex items-center gap-3 px-6 pt-5 pb-4">
                <span className="w-8 h-8 rounded-lg bg-[#E61A21]/10 flex items-center justify-center">
                  <IconUsers size={16} strokeWidth={1.75} className="text-[#E61A21]" aria-hidden="true" />
                </span>
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#E61A21]">
                  Detaylı Sonuçlar
                </p>
                <span className="ml-auto text-[10px] font-black text-zinc-500">
                  {filtered.length} kayıt
                </span>
              </div>

              <div className="divide-y divide-white/[0.04]">
                {filtered.map((r) => {
                  const pct = Number(r.percent || 0);
                  const color = scoreColor(pct);
                  const passed = pct >= 60;

                  return (
                    <div
                      key={r.id}
                      className={`flex items-center gap-4 px-6 py-4 transition-all ${
                        isDark ? "hover:bg-white/[0.03]" : "hover:bg-zinc-50"
                      }`}
                    >
                      {/* Score ring */}
                      <div className="relative shrink-0 w-[52px] h-[52px]">
                        <ScoreRing pct={pct} />
                        <span
                          style={{ color }}
                          className="absolute inset-0 flex items-center justify-center text-[11px] font-black tabular-nums"
                        >
                          {pct}%
                        </span>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className={`text-[13px] font-black truncate ${isDark ? "text-white" : "text-zinc-900"}`}>
                            {r.student_name}
                          </p>
                          <span
                            style={{ backgroundColor: `${color}15`, color }}
                            className="shrink-0 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg"
                          >
                            {passed ? "Geçti" : "Kaldı"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
  <span className="shrink-0 text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 bg-zinc-500/10 text-zinc-500 rounded">
    {r.assessment_label}
  </span>
  <p className={`text-[11px] font-black truncate ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
    {r.quiz_title}
  </p>
</div>
                      </div>

                      {/* Score */}
                      <div className="text-right shrink-0">
                        <p style={{ color }} className="text-lg font-black tabular-nums">
                          {r.score}
                          <span className={`text-[11px] font-bold ml-0.5 ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>
                            /{r.total_questions || 100}
                          </span>
                        </p>

                        {/* Mini progress bar */}
                        <div className={`mt-1.5 h-1 w-24 rounded-full overflow-hidden ${isDark ? "bg-white/[0.06]" : "bg-zinc-100"}`}>
                          <div
                            style={{ width: `${pct}%`, backgroundColor: color, transition: "width 0.6s ease" }}
                            className="h-full rounded-full"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </EgitmenLayout>
  );
}