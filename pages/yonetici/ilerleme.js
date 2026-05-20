import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  Activity,
  AlertTriangle,
  Award,
  BarChart3,
  Brain,
  CheckCircle2,
  Clock,
  Crown,
  Flame,
  LineChart,
  Medal,
  Search,
  ShieldAlert,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Zap,
  ChevronRight,
  X,
} from "lucide-react";
import YoneticiLayout from "../../components/yonetici/YoneticiLayout";

/* ─── tiny helpers ───────────────────────────────────────────── */
const cls = (...args) => args.filter(Boolean).join(" ");

/* Stateless badge */
function Badge({ children, variant = "default", isDark }) {
  const map = {
    success: isDark
      ? "bg-emerald-500/15 text-emerald-400"
      : "bg-emerald-50 text-emerald-700",
    danger: isDark
      ? "bg-red-500/15 text-red-400"
      : "bg-red-50 text-red-600",
    warning: isDark
      ? "bg-amber-500/15 text-amber-400"
      : "bg-amber-50 text-amber-700",
    default: isDark
      ? "bg-zinc-700/60 text-zinc-300"
      : "bg-zinc-100 text-zinc-600",
  };
  return (
    <span
      className={cls(
        "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold tracking-wide",
        map[variant]
      )}
    >
      {children}
    </span>
  );
}

/* Thin horizontal rule */
function Divider({ isDark }) {
  return (
    <div
      className={cls(
        "my-6 h-px",
        isDark ? "bg-white/[0.06]" : "bg-zinc-100"
      )}
    />
  );
}

export default function IlerlemePage() {
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState([]);
  const [users, setUsers] = useState([]);
  const [riskUsers, setRiskUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [weeklyTrends, setWeeklyTrends] = useState([]);
  const [trendMode, setTrendMode] = useState("activeUsers");
  const [kpiModalOpen, setKpiModalOpen] = useState(false);
  const [selectedKpi, setSelectedKpi] = useState(null);
  const [certificateModalOpen, setCertificateModalOpen] = useState(false);
  const [selectedCertificateGroup, setSelectedCertificateGroup] = useState(null);

  useEffect(() => {
    fetchIlerleme();
  }, []);

  async function fetchIlerleme() {
    try {
      const res = await fetch("/api/ilerleme");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "İlerleme verileri alınamadı");
      setKpis(json.kpis || []);
      setUsers(json.users || []);
      setRiskUsers(json.riskUsers || []);
      setCourses(json.courses || []);
      setWeeklyTrends(json.weeklyTrends || []);
      setCertificates(json.certificates || []);
    } catch (err) {
      console.error("İlerleme fetch error:", err.message);
    } finally {
      setLoading(false);
    }
  }

  const filteredUsers = useMemo(() => {
    if (filter === "risk") return users.filter((u) => u.status === "Riskli");
    if (filter === "done") return users.filter((u) => u.status === "Tamamlandı");
    return users;
  }, [filter, users]);

  function openKpiDetails(item) {
    setSelectedKpi(item);
    setKpiModalOpen(true);
  }

  function openCertificateDetails(group) {
  setSelectedCertificateGroup(group);
  setCertificateModalOpen(true);
}

  return (
    <YoneticiLayout
      pageTitle="İLERLEME"
      pageSubtitle="Katılımcı gelişimini, başarı performansını ve risk sinyallerini gerçek zamanlı takip edin."
    >
      {({ isDark }) => (
        <div className="space-y-6">

          {/* ── PAGE HEADER ───────────────────────────────────── */}
          <section
            className={cls(
              "rounded-xl border px-6 py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4",
              isDark
                ? "bg-[#111] border-white/[0.07]"
                : "bg-white border-zinc-200 shadow-sm"
            )}
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-block h-2 w-2 rounded-full bg-[#E61A21]" />
                <span
                  className={cls(
                    "text-[11px] font-semibold tracking-widest uppercase",
                    isDark ? "text-zinc-500" : "text-zinc-400"
                  )}
                >
                  Learning Intelligence Center
                </span>
              </div>
              <h1
                className={cls(
                  "text-2xl font-bold tracking-tight",
                  isDark ? "text-white" : "text-zinc-900"
                )}
              >
                Eğitim İlerlemesi
              </h1>
              <p
                className={cls(
                  "mt-1 text-sm",
                  isDark ? "text-zinc-400" : "text-zinc-500"
                )}
              >
                Kullanıcıların öğrenme yolculuğunu, sınav başarılarını, XP gelişimini ve risk durumlarını analiz edin.
              </p>
            </div>
          </section>

          {/* ── KPI STRIP ─────────────────────────────────────── */}
          <section className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
            {kpis.map((item, i) => {
              const icons = [Users, CheckCircle2, TrendingUp, Clock, ShieldAlert];
              const Icon = item.icon || icons[i] || Activity;
              return (
                <button
                  type="button"
                  key={item.title}
                  onClick={() => openKpiDetails(item)}
                  className={cls(
                    "group relative rounded-xl border p-4 text-left transition-all",
                    isDark
                      ? "bg-[#111] border-white/[0.07] hover:border-white/[0.14] hover:bg-white/[0.03]"
                      : "bg-white border-zinc-200 shadow-sm hover:shadow-md hover:border-zinc-300"
                  )}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={cls(
                        "flex h-8 w-8 items-center justify-center rounded-lg",
                        isDark ? "bg-white/[0.06]" : "bg-zinc-50"
                      )}
                    >
                      <Icon size={16} className="text-[#E61A21]" />
                    </div>
                    <span
                      className={cls(
                        "text-[10px] font-bold rounded px-1.5 py-0.5",
                        isDark
                          ? "bg-emerald-500/15 text-emerald-400"
                          : "bg-emerald-50 text-emerald-700"
                      )}
                    >
                      {item.change}
                    </span>
                  </div>
                  <p
                    className={cls(
                      "text-[11px] font-medium mb-1",
                      isDark ? "text-zinc-500" : "text-zinc-500"
                    )}
                  >
                    {item.title}
                  </p>
                  <p
                    className={cls(
                      "text-xl font-bold tabular-nums",
                      isDark ? "text-white" : "text-zinc-900"
                    )}
                  >
                    {item.value}
                  </p>
                  <ChevronRight
                    size={12}
                    className={cls(
                      "absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity",
                      isDark ? "text-zinc-500" : "text-zinc-400"
                    )}
                  />
                </button>
              );
            })}
          </section>

          {/* ── MAIN GRID ─────────────────────────────────────── */}
          <section className="grid grid-cols-1 xl:grid-cols-3 gap-5">

            {/* User Progress Table */}
            <div
              className={cls(
                "xl:col-span-2 rounded-xl border",
                isDark
                  ? "bg-[#111] border-white/[0.07]"
                  : "bg-white border-zinc-200 shadow-sm"
              )}
            >
              {/* header */}
              <div
                className={cls(
                  "flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b",
                  isDark ? "border-white/[0.07]" : "border-zinc-100"
                )}
              >
                <div>
                  <h2
                    className={cls(
                      "text-base font-semibold",
                      isDark ? "text-white" : "text-zinc-900"
                    )}
                  >
                    Kullanıcı İlerlemesi
                  </h2>
                  <p
                    className={cls(
                      "text-xs mt-0.5",
                      isDark ? "text-zinc-500" : "text-zinc-400"
                    )}
                  >
                    Öğrenme, sınav ve XP performans takibi
                  </p>
                </div>

                <div
                  className={cls(
                    "flex gap-1 rounded-lg p-1",
                    isDark ? "bg-white/[0.04]" : "bg-zinc-100"
                  )}
                >
                  {[
                    ["all", "Tümü"],
                    ["done", "Tamamlanan"],
                    ["risk", "Riskli"],
                  ].map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => setFilter(key)}
                      className={cls(
                        "px-3 py-1.5 rounded-md text-[11px] font-semibold transition-all",
                        filter === key
                          ? "bg-[#E61A21] text-white shadow-sm"
                          : isDark
                          ? "text-zinc-400 hover:text-white"
                          : "text-zinc-500 hover:text-zinc-700"
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* rows */}
              <div className="divide-y divide-white/[0.04]">
                {filteredUsers.map((u) => (
                  <div
                    key={u.name}
                    className={cls(
                      "grid grid-cols-12 gap-4 items-center px-5 py-3.5 transition-colors",
                      isDark
                        ? "hover:bg-white/[0.025]"
                        : "hover:bg-zinc-50"
                    )}
                  >
                    {/* identity */}
                    <div className="col-span-12 sm:col-span-4 flex items-center gap-3">
                      <div className="h-9 w-9 shrink-0 rounded-lg bg-gradient-to-br from-[#E61A21] to-zinc-800 flex items-center justify-center text-base">
                        {u.badge}
                      </div>
                      <div className="min-w-0">
                        <p
                          className={cls(
                            "text-sm font-semibold truncate",
                            isDark ? "text-white" : "text-zinc-900"
                          )}
                        >
                          {u.name}
                        </p>
                        <p
                          className={cls(
                            "text-xs truncate",
                            isDark ? "text-zinc-500" : "text-zinc-400"
                          )}
                        >
                          {u.role}
                        </p>
                      </div>
                    </div>

                    {/* progress bar */}
                    <div className="col-span-12 sm:col-span-4">
                      <div className="flex justify-between mb-1.5">
                        <p
                          className={cls(
                            "text-[11px] font-medium truncate mr-2",
                            isDark ? "text-zinc-400" : "text-zinc-500"
                          )}
                        >
                          {u.course}
                        </p>
                        <span className="text-[11px] font-bold text-[#E61A21] shrink-0">
                          %{u.progress}
                        </span>
                      </div>
                      <div
                        className={cls(
                          "h-1.5 rounded-full overflow-hidden",
                          isDark ? "bg-white/[0.08]" : "bg-zinc-100"
                        )}
                      >
                        <div
                          className="h-full rounded-full bg-[#E61A21] transition-all duration-500"
                          style={{ width: `${u.progress}%` }}
                        />
                      </div>
                    </div>

                    {/* score */}
                    <div className="col-span-6 sm:col-span-2">
                      <p
                        className={cls(
                          "text-[10px] font-medium uppercase tracking-wide mb-0.5",
                          isDark ? "text-zinc-600" : "text-zinc-400"
                        )}
                      >
                        Sınav
                      </p>
                      <p
                        className={cls(
                          "text-sm font-bold tabular-nums",
                          u.score < 60
                            ? "text-[#E61A21]"
                            : isDark
                            ? "text-emerald-400"
                            : "text-emerald-600"
                        )}
                      >
                        {u.score}/100
                      </p>
                    </div>

                    {/* xp */}
                    <div className="col-span-6 sm:col-span-2 text-right">
                      <p
                        className={cls(
                          "text-[10px] font-medium uppercase tracking-wide mb-0.5",
                          isDark ? "text-zinc-600" : "text-zinc-400"
                        )}
                      >
                        XP
                      </p>
                      <p
                        className={cls(
                          "text-sm font-bold tabular-nums",
                          isDark ? "text-white" : "text-zinc-800"
                        )}
                      >
                        {u.xp}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Risk Panel */}
            <div
              className={cls(
                "rounded-xl border",
                isDark
                  ? "bg-[#111] border-white/[0.07]"
                  : "bg-white border-zinc-200 shadow-sm"
              )}
            >
              <div
                className={cls(
                  "flex items-center gap-2.5 px-5 py-4 border-b",
                  isDark ? "border-white/[0.07]" : "border-zinc-100"
                )}
              >
                <div
                  className={cls(
                    "flex h-7 w-7 items-center justify-center rounded-lg",
                    isDark ? "bg-red-500/10" : "bg-red-50"
                  )}
                >
                  <AlertTriangle size={14} className="text-[#E61A21]" />
                </div>
                <div>
                  <h2
                    className={cls(
                      "text-sm font-semibold",
                      isDark ? "text-white" : "text-zinc-900"
                    )}
                  >
                    Risk Altındakiler
                  </h2>
                  <p
                    className={cls(
                      "text-[11px]",
                      isDark ? "text-zinc-500" : "text-zinc-400"
                    )}
                  >
                    Erken uyarı sistemi
                  </p>
                </div>
              </div>

              <div className="divide-y divide-white/[0.04] px-4 py-2">
                {riskUsers.map((r) => (
                  <div key={r.name} className="py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p
                          className={cls(
                            "text-sm font-semibold",
                            isDark ? "text-white" : "text-zinc-900"
                          )}
                        >
                          {r.name}
                        </p>
                        <p
                          className={cls(
                            "text-xs mt-0.5 leading-relaxed",
                            isDark ? "text-zinc-500" : "text-zinc-400"
                          )}
                        >

                          <p
  className={cls(
    "text-[11px] font-medium mb-1",
    isDark ? "text-zinc-400" : "text-zinc-500"
  )}
>
  {r.course}
</p>

                          {r.reason}
                        </p>
                      </div>
                      <span
                        className={cls(
                          "shrink-0 rounded-md px-2 py-0.5 text-[10px] font-bold",
                          isDark
                            ? "bg-red-500/15 text-red-400"
                            : "bg-red-50 text-red-600"
                        )}
                      >
                        {r.level}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── ANALYTICS ─────────────────────────────────────── */}
          <section className="grid grid-cols-1 xl:grid-cols-2 gap-5">

            {/* Course Analysis */}
            <div
              className={cls(
                "rounded-xl border",
                isDark
                  ? "bg-[#111] border-white/[0.07]"
                  : "bg-white border-zinc-200 shadow-sm"
              )}
            >
              <div
                className={cls(
                  "flex items-center justify-between px-5 py-4 border-b",
                  isDark ? "border-white/[0.07]" : "border-zinc-100"
                )}
              >
                <div>
                  <h2
                    className={cls(
                      "text-base font-semibold",
                      isDark ? "text-white" : "text-zinc-900"
                    )}
                  >
                    Eğitim Bazlı Analiz
                  </h2>
                  <p
                    className={cls(
                      "text-xs mt-0.5",
                      isDark ? "text-zinc-500" : "text-zinc-400"
                    )}
                  >
                    Kurs bazında başarı ve katılım oranları
                  </p>
                </div>
                <BarChart3 size={16} className="text-zinc-400" />
              </div>

              <div className="px-5 py-4 space-y-5">
                {courses.map((c) => (
                  <div key={c.title}>
                    <div className="flex justify-between items-center mb-1.5">
                      <p
                        className={cls(
                          "text-sm font-medium",
                          isDark ? "text-zinc-200" : "text-zinc-700"
                        )}
                      >
                        {c.title}
                      </p>
                      <span className="text-sm font-bold text-[#E61A21] tabular-nums">
                        %{c.success}
                      </span>
                    </div>
                    <div
                      className={cls(
                        "h-1.5 rounded-full overflow-hidden",
                        isDark ? "bg-white/[0.07]" : "bg-zinc-100"
                      )}
                    >
                      <div
                        className="h-full rounded-full bg-[#E61A21] transition-all duration-500"
                        style={{ width: `${c.success}%` }}
                      />
                    </div>
                    <p
                      className={cls(
                        "mt-1.5 text-[11px]",
                        isDark ? "text-zinc-600" : "text-zinc-400"
                      )}
                    >
                      {c.join} katılımcı · Ort. süre: {c.duration}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Weekly Trend */}
            <div
              className={cls(
                "rounded-xl border",
                isDark
                  ? "bg-[#111] border-white/[0.07]"
                  : "bg-white border-zinc-200 shadow-sm"
              )}
            >
              <div
                className={cls(
                  "px-5 py-4 border-b",
                  isDark ? "border-white/[0.07]" : "border-zinc-100"
                )}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2
                      className={cls(
                        "text-base font-semibold",
                        isDark ? "text-white" : "text-zinc-900"
                      )}
                    >
                      Haftalık Trend
                    </h2>
                    <p
                      className={cls(
                        "text-xs mt-0.5",
                        isDark ? "text-zinc-500" : "text-zinc-400"
                      )}
                    >
                      Günlük aktivite, ders, başarı ve XP hareketi
                    </p>
                  </div>

                  <div
                    className={cls(
                      "flex gap-1 rounded-lg p-1",
                      isDark ? "bg-white/[0.04]" : "bg-zinc-100"
                    )}
                  >
                    {[
                      ["activeUsers", "Aktif"],
                      ["completedLessons", "Ders"],
                      ["avgScore", "Başarı"],
                      ["xp", "XP"],
                    ].map(([key, label]) => (
                      <button
                        key={key}
                        onClick={() => setTrendMode(key)}
                        className={cls(
                          "px-2.5 py-1.5 rounded-md text-[11px] font-semibold transition-all",
                          trendMode === key
                            ? "bg-[#E61A21] text-white shadow-sm"
                            : isDark
                            ? "text-zinc-400 hover:text-white"
                            : "text-zinc-500 hover:text-zinc-700"
                        )}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* mini stat row */}
              <div
                className={cls(
                  "grid grid-cols-4 divide-x border-b text-center",
                  isDark
                    ? "divide-white/[0.07] border-white/[0.07]"
                    : "divide-zinc-100 border-zinc-100"
                )}
              >
                {[
                  {
                    label: "Aktivite",
                    value: weeklyTrends.reduce(
                      (s, t) => s + Number(t.activeUsers || 0),
                      0
                    ),
                    color: false,
                  },
                  {
                    label: "Ders",
                    value: weeklyTrends.reduce(
                      (s, t) => s + Number(t.completedLessons || 0),
                      0
                    ),
                    color: false,
                  },
                  {
                    label: "Ort. Başarı",
                    value: weeklyTrends.length
                      ? `%${Math.round(
                          weeklyTrends.reduce(
                            (s, t) => s + Number(t.avgScore || 0),
                            0
                          ) / weeklyTrends.length
                        )}`
                      : "%0",
                    color: "emerald",
                  },
                  {
                    label: "Toplam XP",
                    value: weeklyTrends.reduce(
                      (s, t) => s + Number(t.xp || 0),
                      0
                    ),
                    color: "red",
                  },
                ].map((stat) => (
                  <div key={stat.label} className="px-3 py-3">
                    <p
                      className={cls(
                        "text-[10px] font-medium uppercase tracking-wide mb-1",
                        isDark ? "text-zinc-600" : "text-zinc-400"
                      )}
                    >
                      {stat.label}
                    </p>
                    <p
                      className={cls(
                        "text-sm font-bold tabular-nums",
                        stat.color === "emerald"
                          ? isDark
                            ? "text-emerald-400"
                            : "text-emerald-600"
                          : stat.color === "red"
                          ? "text-[#E61A21]"
                          : isDark
                          ? "text-white"
                          : "text-zinc-900"
                      )}
                    >
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* bar chart */}
              <div className="px-5 pt-4 pb-3">
                <div className="flex items-end gap-2 h-40">
                  {weeklyTrends.map((t) => {
                    const value = Number(t[trendMode] || 0);
                    const maxValue = Math.max(
                      ...weeklyTrends.map((x) => Number(x[trendMode] || 0)),
                      1
                    );
                    const height = Math.max((value / maxValue) * 100, 6);
                    return (
                      <div
                        key={t.day}
                        className="group flex-1 flex flex-col items-center gap-1"
                      >
                        <span
  className={cls(
    "text-[11px] font-black tabular-nums mb-1",
    value > 0 ? "text-[#E61A21]" : isDark ? "text-zinc-600" : "text-zinc-400"
  )}
>
  {value}
</span>
                        <div
  className={cls(
    "w-full min-h-[8px] rounded-t transition-all duration-500",
    value > 0
      ? "bg-[#E61A21]"
      : isDark
      ? "bg-white/[0.08]"
      : "bg-zinc-200",
    "group-hover:brightness-110"
  )}
  style={{ height: `${height}%` }}
/>
                        <span
                          className={cls(
                            "text-[10px] font-medium",
                            isDark ? "text-zinc-600" : "text-zinc-400"
                          )}
                        >
                          {t.day}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* ── CERTIFICATES + LEADERBOARD ────────────────────── */}
          <section className="grid grid-cols-1 xl:grid-cols-3 gap-5">

            {/* Certificates */}
            <div
              className={cls(
                "rounded-xl border",
                isDark
                  ? "bg-[#111] border-white/[0.07]"
                  : "bg-white border-zinc-200 shadow-sm"
              )}
            >
              <div
                className={cls(
                  "px-5 py-4 border-b",
                  isDark ? "border-white/[0.07]" : "border-zinc-100"
                )}
              >
                <h2
                  className={cls(
                    "text-base font-semibold",
                    isDark ? "text-white" : "text-zinc-900"
                  )}
                >
                  Sertifika Durumu
                </h2>
              </div>

              <div className="divide-y divide-white/[0.04]">
                {certificates.map((c) => {
                  const certIcons = [Award, Medal, Crown];
                  const Icon = c.icon || certIcons[certificates.indexOf(c)] || Award;
                  return (
                    <button
  type="button"
  key={c.title}
  onClick={() => openCertificateDetails(c)}
  className={cls(
                        "flex items-center justify-between px-5 py-3 transition-colors",
                        isDark ? "hover:bg-white/[0.02]" : "hover:bg-zinc-50"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={15} className="text-[#E61A21]" />
                        <p
                          className={cls(
                            "text-sm",
                            isDark ? "text-zinc-300" : "text-zinc-600"
                          )}
                        >
                          {c.title}
                        </p>
                      </div>
                      <p
                        className={cls(
                          "text-base font-bold tabular-nums",
                          isDark ? "text-white" : "text-zinc-900"
                        )}
                      >
                        {c.value}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Leaderboard */}
            <div
              className={cls(
                "xl:col-span-2 rounded-xl border",
                isDark
                  ? "bg-[#111] border-white/[0.07]"
                  : "bg-white border-zinc-200 shadow-sm"
              )}
            >
              <div
                className={cls(
                  "px-5 py-4 border-b",
                  isDark ? "border-white/[0.07]" : "border-zinc-100"
                )}
              >
                <h2
                  className={cls(
                    "text-base font-semibold",
                    isDark ? "text-white" : "text-zinc-900"
                  )}
                >
                  En Başarılı Katılımcılar
                </h2>
                <p
                  className={cls(
                    "text-xs mt-0.5",
                    isDark ? "text-zinc-500" : "text-zinc-400"
                  )}
                >
                  XP puanına göre sıralama
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4">
                {users
                  .slice()
                  .sort((a, b) => b.xp - a.xp)
                  .slice(0, 3)
                  .map((u, index) => (
                    <div
                      key={u.name}
                      className={cls(
                        "relative rounded-xl border p-4 text-center transition-all",
                        index === 0
                          ? isDark
                            ? "border-[#E61A21]/30 bg-[#E61A21]/[0.06]"
                            : "border-[#E61A21]/20 bg-red-50"
                          : isDark
                          ? "border-white/[0.07] bg-white/[0.02]"
                          : "border-zinc-100 bg-zinc-50"
                      )}
                    >
                      {index === 0 && (
                        <div className="absolute -top-1.5 left-1/2 -translate-x-1/2">
                          <span className="rounded-full bg-[#E61A21] px-2 py-0.5 text-[10px] font-bold text-white">
                            #1
                          </span>
                        </div>
                      )}
                      <div className="text-3xl mb-2 mt-1">
                        {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
                      </div>
                      <h3
                        className={cls(
                          "text-sm font-bold",
                          isDark ? "text-white" : "text-zinc-900"
                        )}
                      >
                        {u.name}
                      </h3>
                      <p
                        className={cls(
                          "text-[11px] mt-0.5 mb-3",
                          isDark ? "text-zinc-500" : "text-zinc-400"
                        )}
                      >
                        {u.course}
                      </p>
                      <p className="text-base font-bold text-[#E61A21] tabular-nums">
                        {u.xp} XP
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          </section>

          {/* ── CERTIFICATE MODAL ─────────────────────────────── */}
{certificateModalOpen && selectedCertificateGroup && typeof document !== "undefined" &&
  createPortal(
    <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div
        className={cls(
          "w-full max-w-lg max-h-[85vh] overflow-hidden rounded-xl border shadow-2xl flex flex-col",
          isDark
            ? "bg-[#111] border-white/[0.1]"
            : "bg-white border-zinc-200"
        )}
      >
        <div
          className={cls(
            "flex items-center justify-between px-5 py-4 border-b",
            isDark ? "border-white/[0.07]" : "border-zinc-100"
          )}
        >
          <div>
            <h2 className={cls("text-sm font-semibold", isDark ? "text-white" : "text-zinc-900")}>
              {selectedCertificateGroup.title} Sertifikaları
            </h2>
            <p className={cls("text-xs mt-1", isDark ? "text-zinc-500" : "text-zinc-400")}>
              Toplam: {selectedCertificateGroup.value}
            </p>
          </div>

          <button
            onClick={() => setCertificateModalOpen(false)}
            className={cls(
              "flex h-7 w-7 items-center justify-center rounded-lg transition-colors",
              isDark
                ? "text-zinc-500 hover:bg-white/[0.08] hover:text-white"
                : "text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
            )}
          >
            <X size={14} />
          </button>
        </div>

        <div className="px-5 py-5 flex-1 overflow-y-auto space-y-3">
          {(selectedCertificateGroup.items || []).length > 0 ? (
            selectedCertificateGroup.items.map((cert) => (
              <div
                key={cert.id}
                className={cls(
                  "rounded-xl border px-4 py-3",
                  isDark
                    ? "border-white/[0.07] bg-white/[0.03]"
                    : "border-zinc-100 bg-zinc-50"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className={cls("text-sm font-bold", isDark ? "text-white" : "text-zinc-900")}>
                      {cert.student_name || "Kullanıcı"}
                    </p>
                    <p className={cls("text-xs mt-1", isDark ? "text-zinc-400" : "text-zinc-500")}>
                      {cert.course_title || "Eğitim bilgisi yok"}
                    </p>
                  </div>

                  <span className="rounded-lg bg-[#E61A21] px-2 py-1 text-[10px] font-bold text-white uppercase">
                    {cert.status}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className={cls("rounded-lg px-3 py-2", isDark ? "bg-black/30" : "bg-white")}>
                    <p className="text-[10px] text-zinc-400">Sertifika Türü</p>
                    <p className={cls("text-xs font-bold", isDark ? "text-zinc-200" : "text-zinc-700")}>
                      {cert.certificate_type || "Belirtilmedi"}
                    </p>
                  </div>

                  <div className={cls("rounded-lg px-3 py-2", isDark ? "bg-black/30" : "bg-white")}>
                    <p className="text-[10px] text-zinc-400">Puan</p>
                    <p className="text-xs font-bold text-[#E61A21]">
                      {cert.score || 0}/100
                    </p>
                  </div>

                  <div className={cls("rounded-lg px-3 py-2", isDark ? "bg-black/30" : "bg-white")}>
                    <p className="text-[10px] text-zinc-400">Tarih</p>
                    <p className={cls("text-xs font-bold", isDark ? "text-zinc-200" : "text-zinc-700")}>
                      {cert.issued_at
                        ? new Date(cert.issued_at).toLocaleDateString("tr-TR")
                        : "Tarih yok"}
                    </p>
                  </div>

                  <div className={cls("rounded-lg px-3 py-2", isDark ? "bg-black/30" : "bg-white")}>
                    <p className="text-[10px] text-zinc-400">PDF</p>
<a
  href={`/api/certificates/download?id=${cert.id}`}
  target="_blank"
  rel="noreferrer"
  className="text-xs font-bold text-[#E61A21] underline"
>
  PDF İndir
</a>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className={cls("text-sm", isDark ? "text-zinc-400" : "text-zinc-500")}>
              Bu durumda sertifika kaydı bulunamadı.
            </p>
          )}
        </div>

        <div className="px-5 pb-5">
          <button
            onClick={() => setCertificateModalOpen(false)}
            className="w-full rounded-lg bg-[#E61A21] py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>,
    document.body
  )}

          {/* ── KPI MODAL ─────────────────────────────────────── */}
          {kpiModalOpen && selectedKpi && typeof document !== "undefined" &&
                  createPortal(
            <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
              <div
                className={cls(
                  "w-full max-w-sm max-h-[85vh] overflow-hidden rounded-xl border shadow-2xl flex flex-col",
                  isDark
                    ? "bg-[#111] border-white/[0.1]"
                    : "bg-white border-zinc-200"
                )}
              >
                {/* modal header */}
                <div
                  className={cls(
                    "flex items-center justify-between px-5 py-4 border-b",
                    isDark ? "border-white/[0.07]" : "border-zinc-100"
                  )}
                >
                  <h2
                    className={cls(
                      "text-sm font-semibold",
                      isDark ? "text-white" : "text-zinc-900"
                    )}
                  >
                    {selectedKpi.title}
                  </h2>
                  <button
                    onClick={() => setKpiModalOpen(false)}
                    className={cls(
                      "flex h-7 w-7 items-center justify-center rounded-lg transition-colors",
                      isDark
                        ? "text-zinc-500 hover:bg-white/[0.08] hover:text-white"
                        : "text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
                    )}
                  >
                    <X size={14} />
                  </button>
                </div>

                {/* modal body */}
<div className="px-5 py-5 flex-1 overflow-y-auto">
  <p className="text-3xl font-bold text-[#E61A21] tabular-nums mb-4">
    {selectedKpi.value}
  </p>

  <p
    className={cls(
      "text-sm font-semibold mb-4",
      isDark ? "text-white" : "text-zinc-900"
    )}
  >
    {selectedKpi.title} listesi
  </p>

  <div className="space-y-3 pr-1">
    {(selectedKpi.students || []).length > 0 ? (
      selectedKpi.students.map((student, index) => (
        <div
          key={index}
          className={cls(
            "rounded-xl border px-4 py-3",
            isDark
              ? "border-white/[0.07] bg-white/[0.03]"
              : "border-zinc-100 bg-zinc-50"
          )}
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p
                className={cls(
                  "text-sm font-bold",
                  isDark ? "text-white" : "text-zinc-900"
                )}
              >
                {student.name}
              </p>
              <p
                className={cls(
                  "text-xs mt-1",
                  isDark ? "text-zinc-400" : "text-zinc-500"
                )}
              >
                {student.course}
              </p>
            </div>

            <span className="rounded-lg bg-[#E61A21] px-2 py-1 text-[11px] font-bold text-white">
              {student.status}
            </span>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className={cls("rounded-lg px-3 py-2", isDark ? "bg-black/30" : "bg-white")}>
              <p className="text-[10px] text-zinc-400">Sınav</p>
              <p className="text-sm font-bold text-emerald-500">
                {student.score}/100
              </p>
            </div>

            <div className={cls("rounded-lg px-3 py-2", isDark ? "bg-black/30" : "bg-white")}>
              <p className="text-[10px] text-zinc-400">XP</p>
              <p className="text-sm font-bold text-[#E61A21]">
                {student.xp}
              </p>
            </div>
          </div>
        </div>
      ))
    ) : (
      <p className={cls("text-sm", isDark ? "text-zinc-400" : "text-zinc-500")}>
        Bu karta ait öğrenci verisi bulunamadı.
      </p>
    )}
  </div>
</div>

                <div
                  className={cls(
                    "px-5 pb-5"
                  )}
                >
                  <button
                    onClick={() => setKpiModalOpen(false)}
                    className="w-full rounded-lg bg-[#E61A21] py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  >
                    Kapat
                  </button>
                </div>
              </div>
            </div>,
document.body
)}

        </div>
      )}
    </YoneticiLayout>
  );
}