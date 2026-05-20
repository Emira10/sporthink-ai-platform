import { useEffect, useMemo, useState } from "react";
import EgitmenLayout from "../../components/egitmen/EgitmenLayout";
import StatCard from "../../components/egitmen/StatCard";
import EmptyState from "../../components/egitmen/EmptyState";
import {
  IconBooks,
  IconCheck,
  IconTrendingUp,
  IconUsers,
  IconFilter,
  IconBuilding,
  IconStar,
  IconAward,
  IconLoader2,
  IconChevronUp,
  IconChevronDown,
  IconMinus,
  IconReportAnalytics,
  IconRefresh,
} from "@tabler/icons-react";

// ── helpers ──────────────────────────────────────────────────────────
const selectCls = (isDark) =>
  `rounded-xl px-4 py-3 border outline-none text-sm font-semibold transition-all duration-200
  ${isDark
    ? "bg-white/[0.03] border-white/10 text-white focus:border-[#E61A21]/50"
    : "bg-white border-zinc-200 text-zinc-900 shadow-sm focus:border-[#E61A21]/50"}`;

function progressColor(pct) {
  if (pct >= 80) return "#22C55E";
  if (pct >= 40) return "#F59E0B";
  return "#E61A21";
}

// ── stat card (local, matches our system) ────────────────────────────
function KpiCard({ isDark, accent, icon: Icon, label, value, sub, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{ borderTop: `3px solid ${accent}` }}
      className={`cursor-pointer hover:scale-[1.02] rounded-[1.25rem] px-5 py-5 transition-all ${
        isDark
          ? "bg-white/[0.02] shadow-[0_0_0_1px_rgba(255,255,255,0.06)]"
          : "bg-white shadow-[0_2px_12px_rgba(0,0,0,0.07)]"
      }`}
    >
      <div className="flex items-center gap-2 mb-3">
        <span style={{ backgroundColor: `${accent}15`, color: accent }}
          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0">
          <Icon size={14} strokeWidth={2} aria-hidden="true" />
        </span>
        <p className="text-[9px] font-black uppercase tracking-[0.25em] text-zinc-500">{label}</p>
      </div>
      <p style={{ color: accent }} className="text-3xl font-black tabular-nums leading-none mb-1">
        {value}
      </p>
      {sub && <p className={`text-[11px] font-semibold mt-1 ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>{sub}</p>}
    </div>
  );
}

// ── insight card ─────────────────────────────────────────────────────
function InsightCard({ isDark, accent, icon: Icon, label, value }) {
  return (
    <div
      style={{ borderLeft: `3px solid ${accent}` }}
      className={`rounded-r-[1.25rem] rounded-l-sm px-5 py-5 ${
        isDark
          ? "bg-white/[0.02] shadow-[0_0_0_1px_rgba(255,255,255,0.06)]"
          : "bg-white shadow-[0_2px_12px_rgba(0,0,0,0.07)]"
      }`}
    >
      <div className="flex items-center gap-2 mb-3">
        <Icon size={14} strokeWidth={2} style={{ color: accent }} aria-hidden="true" />
        <p className="text-[9px] font-black uppercase tracking-[0.25em] text-zinc-500">{label}</p>
      </div>
      <p className={`text-xl font-black italic uppercase leading-tight ${isDark ? "text-white" : "text-zinc-900"}`}>
        {value || "—"}
      </p>
    </div>
  );
}

// ── progress bar ─────────────────────────────────────────────────────
function ProgressBar({ pct, isDark, showLabel = true, height = "h-2" }) {
  const color = progressColor(pct);
  return (
    <div>
      {showLabel && (
        <div className="flex items-center justify-between mb-1.5">
          <span style={{ color }} className="text-[11px] font-black tabular-nums">%{pct}</span>
        </div>
      )}
      <div className={`${height} rounded-full overflow-hidden ${isDark ? "bg-white/[0.06]" : "bg-zinc-100"}`}>
        <div
          style={{ width: `${pct}%`, backgroundColor: color, transition: "width 0.6s ease" }}
          className="h-full rounded-full"
        />
      </div>
    </div>
  );
}

// ── section box ──────────────────────────────────────────────────────
function SBox({ isDark, accent = "#E61A21", icon: Icon, label, sub, children }) {
  return (
    <div
      style={{ borderTop: `3px solid ${accent}` }}
      className={`rounded-[1.5rem] p-6 ${
        isDark
          ? "bg-white/[0.02] shadow-[0_0_0_1px_rgba(255,255,255,0.06)]"
          : "bg-white shadow-[0_2px_16px_rgba(0,0,0,0.07)]"
      }`}
    >
      <div className="flex items-center gap-3 mb-5">
        <span style={{ backgroundColor: `${accent}15`, color: accent }}
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0">
          <Icon size={16} strokeWidth={1.75} aria-hidden="true" />
        </span>
        <div>
          <p style={{ color: accent }} className="text-[9px] font-black uppercase tracking-[0.3em]">{label}</p>
          {sub && <p className={`text-[10px] font-bold mt-0.5 ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>{sub}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

// ── main ─────────────────────────────────────────────────────────────
export default function OgrenciAnaliziPage() {
  // ── state — كودك الأصلي ──
  const [progressRows,    setProgressRows]    = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [departmentFilter,setDepartmentFilter] = useState("All");

  // ── new state ──
  const [sortKey,  setSortKey]  = useState("progress_percent");
  const [sortDir,  setSortDir]  = useState("desc");
  const [search,   setSearch]   = useState("");
  const [selectedKpi, setSelectedKpi] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(null);

  useEffect(() => { fetchProgressData(); }, []);

  // ── fetchProgressData — Backend API ──
async function fetchProgressData() {
  setLoading(true);

  try {
    const res = await fetch("/api/egitmen/ogrenci-analizi");
    const json = await res.json();

    if (!res.ok || !json.ok) {
      console.error("Öğrenci analizi API hatası:", json.message);
      setProgressRows([]);
      return;
    }

    setProgressRows(json.rows || []);
  } catch (err) {
    console.error("Öğrenci analizi fetch hatası:", err);
    setProgressRows([]);
  } finally {
    setLoading(false);
  }
}

  // ── computed — كودك الأصلي ──
  const departments = useMemo(() => {
    const u = [...new Set(progressRows.map((r) => r.profiles?.department).filter(Boolean))];
    return ["All", ...u];
  }, [progressRows]);

  const filteredRows = useMemo(() => {
    let rows = departmentFilter === "All"
      ? progressRows
      : progressRows.filter((r) => r.profiles?.department === departmentFilter);

    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter((r) =>
        (r.profiles?.full_name || "").toLowerCase().includes(q) ||
        (r.profiles?.email     || "").toLowerCase().includes(q) ||
        (r.courses_data?.title || "").toLowerCase().includes(q)
      );
    }

    return [...rows].sort((a, b) => {
      let av = sortKey === "progress_percent" ? (a.progress_percent || 0)
             : sortKey === "is_completed"     ? (a.is_completed ? 1 : 0)
             : 0;
      let bv = sortKey === "progress_percent" ? (b.progress_percent || 0)
             : sortKey === "is_completed"     ? (b.is_completed ? 1 : 0)
             : 0;
      return sortDir === "desc" ? bv - av : av - bv;
    });
  }, [progressRows, departmentFilter, search, sortKey, sortDir]);

  const analytics = useMemo(() => {
    const total    = filteredRows.length;
    const completed = filteredRows.filter((r) => r.is_completed).length;
    const avgProg  = total > 0 ? Math.round(filteredRows.reduce((s, r) => s + (r.progress_percent || 0), 0) / total) : 0;
    const activeLearners = new Set(filteredRows.map((r) => r.profiles?.email).filter(Boolean)).size;
    return { total, completed, averageProgress: avgProg, activeLearners };
  }, [filteredRows]);

  const uniqueStudents = useMemo(() => {
  const map = {};

  filteredRows.forEach((row) => {
    const email = row.profiles?.email;
    if (!email) return;

    if (!map[email]) {
      map[email] = {
        full_name: row.profiles?.full_name || "Bilinmiyor",
        email,
        department: row.profiles?.department || "-",
        totalProgress: 0,
        courseCount: 0,
        completedCount: 0,
      };
    }

    map[email].totalProgress += row.progress_percent || 0;
    map[email].courseCount += 1;
    if (row.is_completed) map[email].completedCount += 1;
  });

  return Object.values(map).map((s) => ({
    ...s,
    averageProgress:
      s.courseCount > 0 ? Math.round(s.totalProgress / s.courseCount) : 0,
  }));
}, [filteredRows]);

  const courseChartData = useMemo(() => {
    const map = {};
    filteredRows.forEach((row) => {
      const title = row.courses_data?.title || "Bilinmeyen Eğitim";
      if (!map[title]) map[title] = { title, count: 0, totalProgress: 0, completed: 0 };
      map[title].count += 1;
      map[title].totalProgress += row.progress_percent || 0;
      if (row.is_completed) map[title].completed += 1;
    });
    return Object.values(map)
      .map((item) => ({
        title:         item.title,
        average:       item.count > 0 ? Math.round(item.totalProgress / item.count) : 0,
        count:         item.count,
        completedRate: item.count > 0 ? Math.round((item.completed / item.count) * 100) : 0,
      }))
      .sort((a, b) => b.average - a.average)
      .slice(0, 6);
  }, [filteredRows]);

  const departmentChartData = useMemo(() => {
  const map = {};

  filteredRows.forEach((row) => {
    const dept = row.profiles?.department || "Belirsiz";

    if (!map[dept]) {
      map[dept] = {
        department: dept,
        total: 0,
        totalProgress: 0,
      };
    }

    map[dept].total += 1;
    map[dept].totalProgress += row.progress_percent || 0;
  });

  return Object.values(map)
    .map((item) => ({
      department: item.department,
      completionRate:
        item.total > 0 ? Math.round(item.totalProgress / item.total) : 0,
    }))
    .sort((a, b) => b.completionRate - a.completionRate);
}, [filteredRows]);

  const topDepartment = useMemo(() => {
    if (!departmentChartData.length) return "-";
    const top = [...departmentChartData].sort((a, b) => b.completionRate - a.completionRate)[0];
    return top ? `${top.department} — %${top.completionRate}` : "-";
  }, [departmentChartData]);

  const strongestCourse = useMemo(() => {
    if (!courseChartData.length) return "-";
    const top = [...courseChartData].sort((a, b) => b.average - a.average)[0];
    return top ? `${top.title} — %${top.average}` : "-";
  }, [courseChartData]);

  // ── sort helper ──
  function toggleSort(key) {
    if (sortKey === key) setSortDir((d) => d === "desc" ? "asc" : "desc");
    else { setSortKey(key); setSortDir("desc"); }
  }

  function SortIcon({ colKey }) {
    if (sortKey !== colKey) return <IconMinus size={11} strokeWidth={2} className="opacity-30" />;
    return sortDir === "desc"
      ? <IconChevronDown size={11} strokeWidth={2.5} className="text-[#E61A21]" />
      : <IconChevronUp   size={11} strokeWidth={2.5} className="text-[#E61A21]" />;
  }

  return (
    <EgitmenLayout
      pageTitle="Öğrenci Analizi"
      pageSubtitle="Katılımcı performansı, ilerleme oranı ve tamamlama durumu"
    >
      {({ isDark }) => (
        <>
          {/* ══════════════════════════════════════
              HEADER + FILTERS
          ══════════════════════════════════════ */}
          <div className="mb-6 flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
            <div>
              <h2 className={`text-xl md:text-2xl font-black italic uppercase ${isDark ? "text-white" : "text-zinc-900"}`}>
                Gelişmiş Öğrenci Analizi
              </h2>
              <p className={`mt-2 text-[10px] font-bold uppercase tracking-[0.2em] ${isDark ? "text-zinc-500" : "text-zinc-600"}`}>
                departman, eğitim ve tamamlama performansını birlikte incele
              </p>
            </div>

            <div className="flex gap-3">
              <button
  type="button"
  onClick={fetchProgressData}
  disabled={loading}
  className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-black transition-all ${
    loading
      ? "opacity-60 cursor-not-allowed"
      : "hover:scale-[1.02]"
  } ${
    isDark
      ? "bg-[#E61A21] text-white shadow-lg shadow-red-500/20"
      : "bg-[#E61A21] text-white shadow-md"
  }`}
>
  <IconRefresh
    size={16}
    strokeWidth={2}
    className={loading ? "animate-spin" : ""}
  />
  Yenile
</button>

              {/* Search — جديد */}
              <div className="relative">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Öğrenci / eğitim ara..."
                  className={`${selectCls(isDark)} pl-4 pr-4 w-52`}
                />
              </div>

              {/* Dept filter — أصلي */}
              <div className="relative">
                <IconFilter size={14} strokeWidth={2}
                  className={`absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none ${isDark ? "text-zinc-500" : "text-zinc-400"}`}
                  aria-hidden="true" />
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className={`${selectCls(isDark)} pl-9`}
                >
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════
              ① KPI CARDS — upgraded from StatCard
          ══════════════════════════════════════ */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-6">
            <KpiCard isDark={isDark} accent="#E61A21" icon={IconBooks}
  label="Toplam Kayıt" value={analytics.total} sub="öğrenme kaydı"
  onClick={() => setSelectedKpi("total")} />

<KpiCard isDark={isDark} accent="#22C55E" icon={IconCheck}
  label="Tamamlayanlar" value={analytics.completed} sub="eğitimi bitirenler"
  onClick={() => setSelectedKpi("completed")} />

<KpiCard isDark={isDark} accent="#3B82F6" icon={IconTrendingUp}
  label="Ortalama İlerleme" value={`%${analytics.averageProgress}`} sub="genel ilerleme oranı"
  onClick={() => setSelectedKpi("average")} />

<KpiCard isDark={isDark} accent="#F59E0B" icon={IconUsers}
  label="Aktif Öğrenci" value={analytics.activeLearners} sub="benzersiz kullanıcı"
  onClick={() => setSelectedKpi("active")} />
          </div>

          {selectedKpi && (
  <div className={`mb-6 rounded-[1.5rem] p-6 border ${
    isDark ? "bg-white/[0.03] border-white/10" : "bg-white border-zinc-200 shadow-lg"
  }`}>
    <div className="flex items-center justify-between mb-5">
      <h3 className={`text-lg font-black italic uppercase ${isDark ? "text-white" : "text-zinc-900"}`}>
        {selectedKpi === "total" && "Tüm Öğrenme Kayıtları"}
        {selectedKpi === "completed" && "Eğitimi Tamamlayan Öğrenciler"}
        {selectedKpi === "average" && "Ortalama İlerleme Detayları"}
        {selectedKpi === "active" && "Aktif Öğrenciler"}
      </h3>

      <button
        onClick={() => setSelectedKpi(null)}
        className="px-4 py-2 rounded-xl bg-[#E61A21] text-white text-xs font-black"
      >
        Kapat
      </button>
    </div>

    <div className="overflow-x-auto">
      <table className="w-full min-w-[900px]">
        <thead>
          <tr className="text-left text-[10px] uppercase tracking-widest text-zinc-500">
            <th className="py-3">Öğrenci</th>
            <th>E-Posta</th>
            <th>Departman</th>
            <th>Eğitim</th>
            <th>İlerleme</th>
            <th>Durum</th>
          </tr>
        </thead>

        <tbody>
          {(selectedKpi === "average" || selectedKpi === "active"
  ? uniqueStudents
  : filteredRows.filter((row) => {
      if (selectedKpi === "completed") return row.is_completed;
      return true;
    })
).map((row) => (
              <tr key={`${selectedKpi}-${row.id}`} className="border-t border-white/10">
                <td className={`py-3 font-bold ${isDark ? "text-white" : "text-zinc-900"}`}>
                  {row.profiles?.full_name || row.full_name || "Bilinmiyor"}
                </td>
                <td className="text-zinc-500">{row.profiles?.email || row.email || "-"}</td>
                <td className="text-zinc-500">{row.profiles?.department || row.department || "-"}</td>
                <td className="text-zinc-500">{row.courses_data?.title || "Genel Ortalama"}</td>
                <td className="font-black text-[#E61A21]">%{row.progress_percent || row.averageProgress || 0}</td>
                <td className={row.is_completed ? "text-green-500 font-black" : "text-amber-500 font-black"}>
                  {row.is_completed
  ? "Tamamlandı"
  : row.completedCount > 0
  ? `${row.completedCount} eğitim tamamlandı`
  : "Devam Ediyor"}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  </div>
)}

          {filteredRows.length === 0 && !loading ? (
            <EmptyState message="Bu departman için ilerleme verisi yok" />
          ) : loading ? (
            <div className="flex items-center justify-center gap-3 py-20">
              <IconLoader2 size={22} strokeWidth={1.75} className="animate-spin text-[#E61A21]" aria-hidden="true" />
              <span className={`text-sm font-bold ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>Yükleniyor...</span>
            </div>
          ) : (
            <>
              {/* ══════════════════════════════════════
                  ② INSIGHTS
              ══════════════════════════════════════ */}
              <SBox isDark={isDark} accent="#8B5CF6" icon={IconStar}
                label="Hızlı İçgörüler" sub="performans özeti ve öne çıkan bilgiler">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InsightCard isDark={isDark} accent="#22C55E" icon={IconBuilding}
                    label="En Başarılı Departman" value={topDepartment} />
                  <InsightCard isDark={isDark} accent="#3B82F6" icon={IconAward}
                    label="En Yüksek Performanslı Eğitim" value={strongestCourse} />
                </div>
              </SBox>

              {/* ══════════════════════════════════════
                  ③ CHARTS GRID
              ══════════════════════════════════════ */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">

                {/* Course progress bars */}
                <SBox isDark={isDark} accent="#E61A21" icon={IconReportAnalytics}
                  label="Eğitim Bazlı Ortalama İlerleme"
                  sub="en yüksek ortalama ilerlemeye sahip eğitimler">
                  {courseChartData.length === 0 ? (
                    <p className="text-sm text-zinc-500">Veri bulunamadı.</p>
                  ) : (
                    <div className="space-y-5">
                      {courseChartData.map((item) => (
                        <div key={item.title}>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <span className={`text-[12px] font-black leading-tight ${isDark ? "text-white" : "text-zinc-900"}`}>
                              {item.title}
                            </span>
                            <div className="flex items-center gap-3 text-[10px] font-black text-zinc-500 shrink-0">
                              <span style={{ color: progressColor(item.average) }}>%{item.average}</span>
                              <button
  type="button"
  onClick={() => setSelectedCourse(item.title)}
  className="underline decoration-dotted underline-offset-4 hover:text-[#E61A21] transition-colors"
>
  {item.count} kayıt
</button>
                              <span className="text-green-500">%{item.completedRate}</span>
                            </div>
                          </div>
                          <ProgressBar pct={item.average} isDark={isDark} showLabel={false} height="h-2" />
                        </div>
                      ))}
                    </div>
                  )}

                  {selectedCourse && (
  <div className={`mt-5 rounded-2xl p-4 border ${
    isDark ? "bg-black/20 border-white/10" : "bg-zinc-50 border-zinc-200"
  }`}>
    <div className="flex items-center justify-between mb-3">
      <h4 className={`text-xs font-black uppercase ${isDark ? "text-white" : "text-zinc-900"}`}>
        {selectedCourse} öğrencileri
      </h4>

      <button
        type="button"
        onClick={() => setSelectedCourse(null)}
        className="text-[10px] font-black text-[#E61A21]"
      >
        Kapat
      </button>
    </div>

    <div className="space-y-2">
      {filteredRows
        .filter((row) => row.courses_data?.title === selectedCourse)
        .map((row) => (
          <div
            key={`course-student-${row.id}`}
            className={`flex items-center justify-between gap-3 rounded-xl px-3 py-2 ${
              isDark ? "bg-white/[0.04]" : "bg-white"
            }`}
          >
            <div>
              <p className={`text-xs font-black ${isDark ? "text-white" : "text-zinc-900"}`}>
                {row.profiles?.full_name || "Bilinmiyor"}
              </p>
              <p className="text-[10px] font-semibold text-zinc-500">
                {row.profiles?.email || "-"} • {row.profiles?.department || "-"}
              </p>
            </div>

            <div className="text-right">
              <p className="text-xs font-black text-[#E61A21]">
                %{row.progress_percent || 0}
              </p>
              <p className={`text-[9px] font-black ${
                row.is_completed ? "text-green-500" : "text-amber-500"
              }`}>
                {row.is_completed ? "Tamamlandı" : "Devam Ediyor"}
              </p>
            </div>
          </div>
        ))}
    </div>
  </div>
)}

                </SBox>

                {/* Department bars */}
                <SBox isDark={isDark} accent="#22C55E" icon={IconBuilding}
                  label="Departman Bazlı Ortalama İlerleme"
                  sub="departmanlara göre ortalama ilerleme karşılaştırması">
                  {departmentChartData.length === 0 ? (
                    <p className="text-sm text-zinc-500">Veri bulunamadı.</p>
                  ) : (
                    <div className="space-y-4">
                      {departmentChartData.map((item) => (
  <div
    key={item.department}
    onClick={() => setSelectedDepartment(item.department)}
    className={`cursor-pointer rounded-xl p-2 transition-all hover:scale-[1.01] ${
  isDark ? "hover:bg-white/[0.03]" : "hover:bg-zinc-50"
}`}
  >
                          <div className="flex items-center justify-between mb-2">
                            <span className={`text-[12px] font-black uppercase ${isDark ? "text-white" : "text-zinc-900"}`}>
                              {item.department}
                            </span>
                            <span style={{ color: progressColor(item.completionRate) }}
                              className="text-[11px] font-black tabular-nums">
                              %{item.completionRate}
                            </span>
                          </div>
                          {/* Multi-segment bar — جديد */}
                          <div className={`h-2 rounded-full overflow-hidden ${isDark ? "bg-white/[0.06]" : "bg-zinc-100"}`}>
                            <div
                              style={{ width: `${item.completionRate}%`, backgroundColor: progressColor(item.completionRate), transition: "width 0.6s ease" }}
                              className="h-full rounded-full"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {selectedDepartment && (
  <div className={`mt-5 rounded-2xl p-4 border ${
    isDark ? "bg-black/20 border-white/10" : "bg-zinc-50 border-zinc-200"
  }`}>
    <div className="flex items-center justify-between mb-3">
      <h4 className={`text-xs font-black uppercase ${isDark ? "text-white" : "text-zinc-900"}`}>
        {selectedDepartment} departmanı öğrencileri
      </h4>

      <button
        type="button"
        onClick={() => setSelectedDepartment(null)}
        className="text-[10px] font-black text-[#E61A21]"
      >
        Kapat
      </button>
    </div>

    <div className="space-y-2">
      {filteredRows
        .filter((row) => row.profiles?.department === selectedDepartment)
        .map((row) => (
          <div
            key={`department-student-${row.id}`}
            className={`flex items-center justify-between gap-3 rounded-xl px-3 py-2 ${
              isDark ? "bg-white/[0.04]" : "bg-white"
            }`}
          >
            <div>
              <p className={`text-xs font-black ${isDark ? "text-white" : "text-zinc-900"}`}>
                {row.profiles?.full_name || "Bilinmiyor"}
              </p>
              <p className="text-[10px] font-semibold text-zinc-500">
                {row.courses_data?.title || "-"}
              </p>
            </div>

            <div className="text-right">
              <p className="text-xs font-black text-[#E61A21]">
                %{row.progress_percent || 0}
              </p>
              <p className={`text-[9px] font-black ${
                row.is_completed ? "text-green-500" : "text-amber-500"
              }`}>
                {row.is_completed ? "Tamamlandı" : "Devam Ediyor"}
              </p>
            </div>
          </div>
        ))}
    </div>
  </div>
)}

                </SBox>
              </div>

              {/* ══════════════════════════════════════
                  ④ TABLE — sortable, enterprise
              ══════════════════════════════════════ */}
              <div
                style={{ borderTop: "3px solid #E61A21" }}
                className={`mt-6 rounded-[1.5rem] overflow-hidden ${
                  isDark
                    ? "bg-white/[0.02] shadow-[0_0_0_1px_rgba(255,255,255,0.06)]"
                    : "bg-white shadow-[0_2px_16px_rgba(0,0,0,0.07)]"
                }`}
              >
                <div className="flex items-center gap-3 px-6 pt-5 pb-4">
                  <span className="w-8 h-8 rounded-lg bg-[#E61A21]/10 flex items-center justify-center">
                    <IconUsers size={16} strokeWidth={1.75} className="text-[#E61A21]" aria-hidden="true" />
                  </span>
                  <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#E61A21] flex-1">
                    Detaylı Öğrenci Tablosu
                  </p>
                  <span className={`text-[10px] font-black ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>
                    {filteredRows.length} kayıt
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1100px]">
                    <thead>
                      <tr className={`border-y ${isDark ? "border-white/[0.06] bg-white/[0.02]" : "border-zinc-100 bg-zinc-50"}`}>
                        {[
                          { label: "Öğrenci",   key: null },
                          { label: "E-Posta",   key: null },
                          { label: "Departman", key: null },
                          { label: "Eğitim",    key: null },
                          { label: "Kategori",  key: null },
                          { label: "Tür",       key: null },
                          { label: "İlerleme",  key: "progress_percent" },
                          { label: "Durum",     key: "is_completed" },
                        ].map(({ label, key }) => (
                          <th key={label}
                            onClick={key ? () => toggleSort(key) : undefined}
                            className={`text-left px-5 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 ${key ? "cursor-pointer select-none hover:text-zinc-300 transition-colors" : ""}`}
                          >
                            <div className="flex items-center gap-1.5">
                              {label}
                              {key && <SortIcon colKey={key} />}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {filteredRows.map((row) => {
                        const progress  = row.progress_percent || 0;
                        const completed = row.is_completed;
                        const color     = progressColor(progress);

                        return (
                          <tr key={row.id}
                            className={`border-b transition-all ${
                              isDark
                                ? "border-white/[0.04] hover:bg-white/[0.03]"
                                : "border-zinc-50 hover:bg-zinc-50"
                            }`}
                          >
                            {/* Öğrenci */}
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div style={{ backgroundColor: `${color}20`, color }}
                                  className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black shrink-0">
                                  {(row.profiles?.full_name || "?").charAt(0).toUpperCase()}
                                </div>
                                <span className={`text-[13px] font-black ${isDark ? "text-white" : "text-zinc-900"}`}>
                                  {row.profiles?.full_name || "Bilinmiyor"}
                                </span>
                              </div>
                            </td>

                            <td className="px-5 py-4 text-[11px] font-semibold text-zinc-500">
                              {row.profiles?.email || "-"}
                            </td>

                            <td className="px-5 py-4">
                              <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg ${
                                isDark ? "bg-white/[0.06] text-zinc-400" : "bg-zinc-100 text-zinc-500"
                              }`}>
                                {row.profiles?.department || "-"}
                              </span>
                            </td>

                            <td className={`px-5 py-4 text-[12px] font-semibold max-w-[180px] ${isDark ? "text-zinc-200" : "text-zinc-800"}`}>
                              <span className="truncate block">{row.courses_data?.title || "-"}</span>
                            </td>

                            <td className="px-5 py-4 text-[11px] font-semibold text-zinc-500 uppercase">
                              {row.courses_data?.category || "-"}
                            </td>

                            <td className="px-5 py-4">
                              <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg ${
                                isDark ? "bg-white/[0.06] text-zinc-400" : "bg-zinc-100 text-zinc-500"
                              }`}>
                                {row.courses_data?.type || "-"}
                              </span>
                            </td>

                            {/* İlerleme — upgraded */}
                            <td className="px-5 py-4">
                              <div className="w-[140px]">
                                <div className="flex items-center justify-between mb-1.5">
                                  <span style={{ color }} className="text-[11px] font-black tabular-nums">
                                    %{progress}
                                  </span>
                                </div>
                                <div className={`h-1.5 rounded-full overflow-hidden ${isDark ? "bg-white/[0.06]" : "bg-zinc-100"}`}>
                                  <div
                                    style={{ width: `${progress}%`, backgroundColor: color, transition: "width 0.6s ease" }}
                                    className="h-full rounded-full"
                                  />
                                </div>
                              </div>
                            </td>

                            {/* Durum */}
                            <td className="px-5 py-4">
                              <span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[9px] font-black uppercase tracking-widest ${
                                completed
                                  ? "bg-green-500/10 text-green-500"
                                  : "bg-amber-500/10 text-amber-500"
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${completed ? "bg-green-500" : "bg-amber-500"}`} />
                                {completed ? "Tamamlandı" : "Devam Ediyor"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </EgitmenLayout>
  );
}