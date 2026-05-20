import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  AreaChart,
  Award,
  BarChart3,
  Brain,
  Briefcase,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Download,
  FileSpreadsheet,
  Filter,
  Flame,
  Layers3,
  LineChart,
  Mail,
  Medal,
  Radar,
  RefreshCcw,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from "lucide-react";
import YoneticiLayout from "../../components/yonetici/YoneticiLayout";

/* ─── util ──────────────────────────────────────────────────── */
const cx = (...a) => a.filter(Boolean).join(" ");

/* Risk level helper */
function riskLevel(val) {
  if (val >= 20) return { label: "Yüksek", color: "red" };
  if (val >= 10) return { label: "Orta", color: "amber" };
  return { label: "Düşük", color: "emerald" };
}

/* Inline select wrapper */
function FilterSelect({ icon: Icon, value, onChange, options, isDark }) {
  return (
    <div className="relative flex items-center">
      <Icon
        size={13}
        className="absolute left-3 text-zinc-400 pointer-events-none"
      />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cx(
          "appearance-none h-8 pl-8 pr-7 rounded-lg text-xs font-medium outline-none border transition-colors cursor-pointer",
          isDark
            ? "bg-white/[0.05] border-white/[0.08] text-zinc-200 hover:border-white/20 focus:border-[#E61A21]/50"
            : "bg-white border-zinc-200 text-zinc-700 hover:border-zinc-300 focus:border-[#E61A21]/50 shadow-sm"
        )}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <ChevronDown
        size={11}
        className="absolute right-2.5 text-zinc-400 pointer-events-none"
      />
    </div>
  );
}

/* Thin KPI card */
function StatCard({ title, value, change, Icon, isDark }) {
  const isUp = change && change.startsWith("+");
  const isDown = change && change.startsWith("-");
  return (
    <div
      className={cx(
        "rounded-xl border p-4 flex flex-col justify-between gap-4 transition-all",
        isDark
          ? "bg-[#111] border-white/[0.07] hover:border-white/[0.14]"
          : "bg-white border-zinc-200 shadow-sm hover:shadow-md"
      )}
    >
      <div className="flex items-start justify-between">
        <div
          className={cx(
            "flex h-8 w-8 items-center justify-center rounded-lg",
            isDark ? "bg-white/[0.06]" : "bg-zinc-50 border border-zinc-100"
          )}
        >
          <Icon size={15} className="text-[#E61A21]" />
        </div>
        {change && (
          <span
            className={cx(
              "flex items-center gap-0.5 text-[11px] font-semibold rounded-md px-1.5 py-0.5",
              isUp
                ? isDark
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "bg-emerald-50 text-emerald-700"
                : isDown
                ? isDark
                  ? "bg-red-500/10 text-red-400"
                  : "bg-red-50 text-red-600"
                : isDark
                ? "bg-zinc-700/50 text-zinc-400"
                : "bg-zinc-100 text-zinc-500"
            )}
          >
            {isUp ? (
              <ArrowUpRight size={11} />
            ) : isDown ? (
              <ArrowDownRight size={11} />
            ) : (
              <Minus size={11} />
            )}
            {change}
          </span>
        )}
      </div>
      <div>
        <p
          className={cx(
            "text-[11px] font-medium mb-1",
            isDark ? "text-zinc-500" : "text-zinc-400"
          )}
        >
          {title}
        </p>
        <p
          className={cx(
            "text-2xl font-bold tabular-nums tracking-tight",
            isDark ? "text-white" : "text-zinc-900"
          )}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

export default function RaporlarPage() {
  const [selectedDepartment, setSelectedDepartment] = useState("Tümü");
  const [selectedRange, setSelectedRange] = useState("7 Gün");
  const [selectedRisk, setSelectedRisk] = useState("Tümü");
  const [loading, setLoading] = useState(true);
  const [executiveCards, setExecutiveCards] = useState([]);
  const [aiInsights, setAiInsights] = useState([]);
  const [liveFeed, setLiveFeed] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [forecasts, setForecasts] = useState([]);
  const [reportStats, setReportStats] = useState({
    totalReports: 0,
    downloaded: 0,
    generatedToday: 0,
    aiGenerated: 0,
  });
  const [showDeptMenu, setShowDeptMenu] = useState(false);
  const [showRangeMenu, setShowRangeMenu] = useState(false);
  const [showRiskMenu, setShowRiskMenu] = useState(false);
  const [aiSummary, setAiSummary] = useState("");
  const [activeCard, setActiveCard] = useState(null);

  useEffect(() => {
    fetchRaporlar();
  }, []);

  async function fetchRaporlar() {
    try {
      setLoading(true);
      const res = await fetch("/api/raporlar");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Rapor verileri alınamadı");
      setExecutiveCards(json.executiveCards || []);
      setAiInsights(json.aiInsights || []);
      setLiveFeed(json.liveFeed || []);
      setDepartments(json.departments || []);
      setForecasts(json.forecasts || []);
      setReportStats(
        json.reportStats || {
          totalReports: 0,
          downloaded: 0,
          generatedToday: 0,
          aiGenerated: 0,
        }
      );
    } catch (err) {
      console.error("Raporlar fetch error:", err.message);
    } finally {
      setLoading(false);
    }
  }

  const filteredDepartments = departments.filter((d) => {
    const depOk =
      selectedDepartment === "Tümü" || d.name === selectedDepartment;
    const riskOk =
      selectedRisk === "Tümü" ||
      (selectedRisk === "Düşük Risk" && d.risk < 10) ||
      (selectedRisk === "Orta Risk" && d.risk >= 10 && d.risk < 20) ||
      (selectedRisk === "Yüksek Risk" && d.risk >= 20);
    return depOk && riskOk;
  });

  function generateAiAnalysis() {
    const weakest = [...departments].sort((a, b) => a.success - b.success)[0];
    const riskiest = [...departments].sort((a, b) => b.risk - a.risk)[0];
    setAiSummary(
      `${selectedRange} raporuna göre en düşük başarı ${weakest?.name || "-"} departmanında görülüyor. En yüksek risk oranı ise ${riskiest?.name || "-"} departmanında. AI önerisi: risk oranı yüksek departmanlara destek eğitimi atanmalı.`
    );
  }

  function downloadCSV() {
    logReportAction("excel");
  const rows = [
    ["Departman", "Kullanıcı Sayısı", "Başarı Oranı", "Risk Oranı"],
    ...filteredDepartments.map((d) => [
      d.name,
      d.users,
      `%${d.success}`,
      `%${d.risk}`,
    ]),
  ];

  const csv =
    "\uFEFF" +
    rows
      .map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(";")
      )
      .join("\n");

  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `sporthink-rapor-${selectedRange}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

async function logReportAction(actionType) {
  await fetch("/api/raporlar/log-action", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action_type: actionType,
      report_range: selectedRange,
      department: selectedDepartment,
      risk_filter: selectedRisk,
    }),
  });

  fetchRaporlar();
}

  function downloadPDF() {
    logReportAction("pdf");
  const today = new Date().toLocaleDateString("tr-TR");

  const rows = filteredDepartments
    .map(
      (d) => `
      <tr>
        <td>${d.name}</td>
        <td>${d.users}</td>
        <td>%${d.success}</td>
        <td>%${d.risk}</td>
      </tr>
    `
    )
    .join("");

  const riskRows = forecasts
    .map(
      (r) => `
      <tr>
        <td>${r.name}</td>
        <td>%${r.risk}</td>
        <td>${r.message}</td>
      </tr>
    `
    )
    .join("");

  const html = `
  <html>
    <head>
      <title>SporThink Rapor</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 40px;
          color: #111827;
        }
        .header {
          background: linear-gradient(135deg, #111827, #E61A21);
          color: white;
          padding: 28px;
          border-radius: 18px;
          margin-bottom: 25px;
        }
        .brand {
          font-size: 28px;
          font-weight: 900;
        }
        .subtitle {
          margin-top: 8px;
          opacity: .9;
        }
        .meta {
          margin-top: 14px;
          font-size: 13px;
          opacity: .85;
        }
        h2 {
          margin-top: 28px;
          color: #E61A21;
          font-size: 18px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 12px;
          font-size: 13px;
        }
        th {
          background: #E61A21;
          color: white;
          text-align: left;
          padding: 12px;
        }
        td {
          border-bottom: 1px solid #e5e7eb;
          padding: 11px;
        }
        tr:nth-child(even) {
          background: #f9fafb;
        }
        .footer {
          margin-top: 35px;
          font-size: 12px;
          color: #6b7280;
          border-top: 1px solid #e5e7eb;
          padding-top: 15px;
        }
        @media print {
          button { display: none; }
          body { padding: 20px; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="brand">SporThink Yönetici Raporu</div>
        <div class="subtitle">Departman performansı, kullanıcı dağılımı ve risk analizi</div>
        <div class="meta">
          Tarih: ${today} • Dönem: ${selectedRange} • Departman: ${selectedDepartment} • Risk: ${selectedRisk}
        </div>
      </div>

      <h2>Departman Performansı</h2>
      <table>
        <thead>
          <tr>
            <th>Departman</th>
            <th>Kullanıcı</th>
            <th>Başarı</th>
            <th>Risk</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>

      <h2>Risk Öngörüsü</h2>
      <table>
        <thead>
          <tr>
            <th>Kullanıcı / Grup</th>
            <th>Risk</th>
            <th>Açıklama</th>
          </tr>
        </thead>
        <tbody>${riskRows}</tbody>
      </table>

      <div class="footer">
        Bu rapor SporThink AI destekli online eğitim platformu üzerinden oluşturulmuştur.
      </div>

      <script>
        window.onload = function() {
          window.print();
        };
      </script>
    </body>
  </html>
  `;

  const win = window.open("", "_blank");
  win.document.write(html);
  win.document.close();
}

  function sendMailReport() {
    logReportAction("email");
    const subject = encodeURIComponent("SporThink Yönetici Raporu");
    const body = encodeURIComponent(
      `Merhaba,\n\n${selectedRange} için oluşturulan rapor özeti aşağıdadır:\n\n` +
        filteredDepartments
          .map((d) => `${d.name}: Başarı %${d.success}, Risk %${d.risk}`)
          .join("\n") +
        `\n\nAI Özet:\n${aiSummary || "AI analizi henüz oluşturulmadı."}`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  }

  return (
    <YoneticiLayout
      pageTitle="RAPORLAR"
      pageSubtitle="Yapay zekâ destekli yönetim raporları, canlı analizler ve performans öngörüleri"
    >
      {({ isDark }) => (
        <div className="space-y-5">

          {/* ── PAGE HEADER + FILTER TOOLBAR ────────────────── */}
          <section
            className={cx(
              "rounded-xl border px-5 py-4",
              isDark
                ? "bg-[#111] border-white/[0.07]"
                : "bg-white border-zinc-200 shadow-sm"
            )}
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* left: title */}
              <div className="flex items-center gap-3">
                <div
                  className={cx(
                    "flex h-9 w-9 items-center justify-center rounded-lg",
                    isDark ? "bg-[#E61A21]/10" : "bg-red-50"
                  )}
                >
                  <BarChart3 size={16} className="text-[#E61A21]" />
                </div>
                <div>
                  <h1
                    className={cx(
                      "text-base font-semibold leading-none",
                      isDark ? "text-white" : "text-zinc-900"
                    )}
                  >
                    Kurumsal Raporlar
                  </h1>
                  <p
                    className={cx(
                      "text-xs mt-0.5",
                      isDark ? "text-zinc-500" : "text-zinc-400"
                    )}
                  >
                    Departman performansı · Risk analizi · Dışa aktarım
                  </p>
                </div>
              </div>

              {/* right: filters + refresh */}
              <div className="flex flex-wrap items-center gap-2">
                <div
                  className={cx(
                    "flex items-center gap-1.5 px-2 py-1 rounded-lg border",
                    isDark
                      ? "border-white/[0.07] bg-white/[0.03]"
                      : "border-zinc-100 bg-zinc-50"
                  )}
                >
                  <Filter size={11} className="text-zinc-400" />
                  <span
                    className={cx(
                      "text-[11px] font-medium",
                      isDark ? "text-zinc-500" : "text-zinc-400"
                    )}
                  >
                    Filtreler
                  </span>
                </div>

                <FilterSelect
                  icon={Building2}
                  value={selectedDepartment}
                  onChange={setSelectedDepartment}
                  options={["Tümü", ...departments.map((d) => d.name)]}
                  isDark={isDark}
                />
                <FilterSelect
                  icon={CalendarDays}
                  value={selectedRange}
                  onChange={setSelectedRange}
                  options={["7 Gün", "14 Gün", "30 Gün", "90 Gün"]}
                  isDark={isDark}
                />
                <FilterSelect
                  icon={ShieldAlert}
                  value={selectedRisk}
                  onChange={setSelectedRisk}
                  options={[
                    "Tümü",
                    "Düşük Risk",
                    "Orta Risk",
                    "Yüksek Risk",
                  ]}
                  isDark={isDark}
                />

                <button
                  type="button"
                  onClick={fetchRaporlar}
                  disabled={loading}
                  className={cx(
                    "flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold border transition-all disabled:opacity-50",
                    isDark
                      ? "bg-white/[0.06] border-white/[0.1] text-zinc-200 hover:bg-white/[0.1]"
                      : "bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50 shadow-sm"
                  )}
                >
                  <RefreshCcw
                    size={12}
                    className={loading ? "animate-spin" : ""}
                  />
                  {loading ? "Yükleniyor" : "Yenile"}
                </button>
              </div>
            </div>
          </section>

          {/* ── EXECUTIVE KPI STRIP ─────────────────────────── */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {executiveCards.map((card, i) => {
              const icons = [Layers3, TrendingUp, ShieldAlert, Zap];
              const Icon = card.icon || icons[i] || Activity;
              return (
                <div
  key={card.title}
  onClick={() =>
    setActiveCard(activeCard === card.title ? null : card.title)
  }
  className="cursor-pointer"
>
  <StatCard
    title={card.title}
    value={card.value}
    change={card.change}
    Icon={Icon}
    isDark={isDark}
  />
</div>
              );
            })}
          </section>

          {activeCard && (
  <section
    className={cx(
      "rounded-2xl border p-5 space-y-4",
      isDark
        ? "bg-[#111] border-white/[0.07]"
        : "bg-white border-zinc-200 shadow-sm"
    )}
  >
    <div className="flex items-center justify-between">
      <div>
        <h2
          className={cx(
            "text-lg font-bold",
            isDark ? "text-white" : "text-zinc-900"
          )}
        >
          {activeCard} Detayları
        </h2>

        <p
          className={cx(
            "text-sm mt-1",
            isDark ? "text-zinc-500" : "text-zinc-400"
          )}
        >
          Gerçek zamanlı sistem verileri
        </p>
      </div>

      <button
        onClick={() => setActiveCard(null)}
        className="px-3 py-1 rounded-lg bg-red-500 text-white text-xs font-bold"
      >
        Kapat
      </button>
    </div>

    {/* TOPLAM KULLANICI */}
    {activeCard === "Toplam Kullanıcı" && (
      <div className="space-y-3">
        {departments.map((d) => (
          <div
            key={d.name}
            className={cx(
              "rounded-xl p-4 flex items-center justify-between",
              isDark ? "bg-white/[0.04]" : "bg-zinc-50"
            )}
          >
            <div>
              <p className="font-bold">{d.name}</p>
              <p className="text-xs opacity-70">
                Departman kullanıcı sayısı
              </p>
            </div>

            <div className="text-2xl font-black text-[#E61A21]">
              {d.users}
            </div>
          </div>
        ))}
      </div>
    )}

    {/* ORTALAMA BAŞARI */}
    {activeCard === "Ortalama Başarı" && (
      <div className="space-y-3">
        {departments.map((d) => (
          <div key={d.name}>
            <div className="flex justify-between mb-1">
              <span className="font-semibold">{d.name}</span>
              <span className="text-[#E61A21] font-bold">
                %{d.success}
              </span>
            </div>

            <div
              className={cx(
                "h-3 rounded-full overflow-hidden",
                isDark ? "bg-white/[0.08]" : "bg-zinc-100"
              )}
            >
              <div
                className="h-full bg-[#E61A21]"
                style={{ width: `${d.success}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    )}

    {/* RISK */}
    {activeCard === "Risk Oranı" && (
      <div className="space-y-3">
        {forecasts.map((r) => (
          <div
            key={r.name}
            className={cx(
              "rounded-xl p-4",
              isDark ? "bg-red-500/10" : "bg-red-50"
            )}
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="font-bold">{r.name}</p>
                <p className="text-xs opacity-70">
                  {r.message}
                </p>
              </div>

              <div className="text-2xl font-black text-red-500">
                %{r.risk}
              </div>
            </div>
          </div>
        ))}
      </div>
    )}

    {/* AI */}
    {activeCard === "AI Analiz" && (
      <div className="space-y-3">
        {aiInsights.map((a, i) => (
          <div
            key={i}
            className={cx(
              "rounded-xl p-4",
              isDark ? "bg-white/[0.04]" : "bg-zinc-50"
            )}
          >
            <p className="font-bold mb-1">{a.title}</p>

            <p
              className={cx(
                "text-sm",
                isDark ? "text-zinc-400" : "text-zinc-600"
              )}
            >
              {a.text}
            </p>
          </div>
        ))}
      </div>
    )}
  </section>
)}

          {/* ── MAIN CONTENT GRID ───────────────────────────── */}
          <section className="grid grid-cols-1 xl:grid-cols-5 gap-5">

            {/* DEPARTMENT TABLE — 3 cols */}
            <div
              className={cx(
                "xl:col-span-3 rounded-xl border overflow-hidden",
                isDark
                  ? "bg-[#111] border-white/[0.07]"
                  : "bg-white border-zinc-200 shadow-sm"
              )}
            >
              {/* card header */}
              <div
                className={cx(
                  "flex items-center justify-between px-5 py-3.5 border-b",
                  isDark ? "border-white/[0.07]" : "border-zinc-100"
                )}
              >
                <div>
                  <h2
                    className={cx(
                      "text-sm font-semibold",
                      isDark ? "text-white" : "text-zinc-900"
                    )}
                  >
                    Departman Performansı
                  </h2>
                  <p
                    className={cx(
                      "text-xs mt-0.5",
                      isDark ? "text-zinc-500" : "text-zinc-400"
                    )}
                  >
                    {filteredDepartments.length} departman · {selectedRange}
                  </p>
                </div>
                <Building2 size={15} className="text-zinc-400" />
              </div>

              {/* table header */}
              <div
                className={cx(
                  "grid grid-cols-12 gap-3 px-5 py-2.5 text-[10px] font-semibold uppercase tracking-wider border-b",
                  isDark
                    ? "border-white/[0.05] text-zinc-600"
                    : "border-zinc-50 text-zinc-400 bg-zinc-50/50"
                )}
              >
                <span className="col-span-4">Departman</span>
                <span className="col-span-2 text-right">Kullanıcı</span>
                <span className="col-span-4">Başarı</span>
                <span className="col-span-2 text-right">Risk</span>
              </div>

              {/* table rows */}
              <div className="divide-y divide-white/[0.04]">
                {filteredDepartments.map((dep) => {
                  const risk = riskLevel(dep.risk);
                  return (
                    <div
                      key={dep.name}
                      className={cx(
                        "grid grid-cols-12 gap-3 px-5 py-3 items-center transition-colors",
                        isDark
                          ? "hover:bg-white/[0.025]"
                          : "hover:bg-zinc-50/80"
                      )}
                    >
                      {/* name */}
                      <div className="col-span-4">
                        <p
                          className={cx(
                            "text-sm font-medium",
                            isDark ? "text-zinc-200" : "text-zinc-800"
                          )}
                        >
                          {dep.name}
                        </p>
                      </div>

                      {/* users */}
                      <div className="col-span-2 text-right">
                        <span
                          className={cx(
                            "text-xs font-semibold tabular-nums",
                            isDark ? "text-zinc-400" : "text-zinc-500"
                          )}
                        >
                          {dep.users}
                        </span>
                      </div>

                      {/* progress + value */}
                      <div className="col-span-4 flex items-center gap-2.5">
                        <div
                          className={cx(
                            "flex-1 h-1.5 rounded-full overflow-hidden",
                            isDark ? "bg-white/[0.08]" : "bg-zinc-100"
                          )}
                        >
                          <div
                            className="h-full rounded-full bg-[#E61A21] transition-all duration-500"
                            style={{ width: `${dep.success}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-[#E61A21] tabular-nums w-8 text-right shrink-0">
                          %{dep.success}
                        </span>
                      </div>

                      {/* risk badge */}
                      <div className="col-span-2 flex justify-end">
                        <span
                          className={cx(
                            "text-[10px] font-semibold px-2 py-0.5 rounded-md",
                            risk.color === "red"
                              ? isDark
                                ? "bg-red-500/10 text-red-400"
                                : "bg-red-50 text-red-600"
                              : risk.color === "amber"
                              ? isDark
                                ? "bg-amber-500/10 text-amber-400"
                                : "bg-amber-50 text-amber-700"
                              : isDark
                              ? "bg-emerald-500/10 text-emerald-400"
                              : "bg-emerald-50 text-emerald-700"
                          )}
                        >
                          %{dep.risk}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* table footer */}
              <div
                className={cx(
                  "px-5 py-3 border-t",
                  isDark ? "border-white/[0.06]" : "border-zinc-100"
                )}
              >
                <div className="flex items-center gap-4">
                  {[
                    { label: "Ort. Başarı", val: filteredDepartments.length ? `%${Math.round(filteredDepartments.reduce((s, d) => s + d.success, 0) / filteredDepartments.length)}` : "—" },
                    { label: "Toplam Kullanıcı", val: filteredDepartments.reduce((s, d) => s + (d.users || 0), 0) },
                    { label: "Ort. Risk", val: filteredDepartments.length ? `%${Math.round(filteredDepartments.reduce((s, d) => s + d.risk, 0) / filteredDepartments.length)}` : "—" },
                  ].map((stat) => (
                    <div key={stat.label} className="flex items-center gap-1.5">
                      <span className={cx("text-[10px]", isDark ? "text-zinc-600" : "text-zinc-400")}>
                        {stat.label}:
                      </span>
                      <span className={cx("text-xs font-semibold tabular-nums", isDark ? "text-zinc-300" : "text-zinc-700")}>
                        {stat.val}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN — risk forecast + AI — 2 cols */}
            <div className="xl:col-span-2 flex flex-col gap-5">

              {/* AI Risk Forecast */}
              <div
                className={cx(
                  "rounded-xl border flex-1",
                  isDark
                    ? "bg-[#111] border-white/[0.07]"
                    : "bg-white border-zinc-200 shadow-sm"
                )}
              >
                <div
                  className={cx(
                    "flex items-center justify-between px-5 py-3.5 border-b",
                    isDark ? "border-white/[0.07]" : "border-zinc-100"
                  )}
                >
                  <div>
                    <h2
                      className={cx(
                        "text-sm font-semibold",
                        isDark ? "text-white" : "text-zinc-900"
                      )}
                    >
                      Risk Öngörüsü
                    </h2>
                    <p
                      className={cx(
                        "text-xs mt-0.5",
                        isDark ? "text-zinc-500" : "text-zinc-400"
                      )}
                    >
                      AI destekli erken uyarı
                    </p>
                  </div>
                  <Radar size={15} className="text-[#E61A21]" />
                </div>

                <div className="divide-y divide-white/[0.04]">
                  {forecasts.map((item) => {
                    const r = riskLevel(item.risk);
                    return (
                      <div
                        key={item.name}
                        className={cx(
                          "px-5 py-3.5 transition-colors",
                          isDark ? "hover:bg-white/[0.02]" : "hover:bg-zinc-50"
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <p
                                className={cx(
                                  "text-sm font-semibold",
                                  isDark ? "text-white" : "text-zinc-900"
                                )}
                              >
                                {item.name}
                              </p>
                              <span
                                className={cx(
                                  "text-[10px] font-semibold px-1.5 py-0.5 rounded",
                                  r.color === "red"
                                    ? isDark
                                      ? "bg-red-500/10 text-red-400"
                                      : "bg-red-50 text-red-600"
                                    : r.color === "amber"
                                    ? isDark
                                      ? "bg-amber-500/10 text-amber-400"
                                      : "bg-amber-50 text-amber-700"
                                    : isDark
                                    ? "bg-emerald-500/10 text-emerald-400"
                                    : "bg-emerald-50 text-emerald-700"
                                )}
                              >
                                {r.label}
                              </span>
                            </div>
                            <p
                              className={cx(
                                "text-xs leading-relaxed",
                                isDark ? "text-zinc-500" : "text-zinc-400"
                              )}
                            >
                              {item.message}
                            </p>
                          </div>
                          <div className="shrink-0 text-right">
                            <p className="text-lg font-bold text-[#E61A21] tabular-nums leading-none">
                              %{item.risk}
                            </p>
                            <p
                              className={cx(
                                "text-[10px] mt-0.5",
                                isDark ? "text-zinc-600" : "text-zinc-400"
                              )}
                            >
                              Risk
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
          </div>
        </section>

          {/* ── EXPORT + REPORT STATS ───────────────────────── */}
          <section className="grid grid-cols-1 xl:grid-cols-2 gap-5">

            {/* Export */}
            <div
              className={cx(
                "rounded-xl border px-5 py-4",
                isDark
                  ? "bg-[#111] border-white/[0.07]"
                  : "bg-white border-zinc-200 shadow-sm"
              )}
            >
              <div
                className={cx(
                  "flex items-center justify-between pb-3.5 mb-3.5 border-b",
                  isDark ? "border-white/[0.07]" : "border-zinc-100"
                )}
              >
                <div>
                  <h2
                    className={cx(
                      "text-sm font-semibold",
                      isDark ? "text-white" : "text-zinc-900"
                    )}
                  >
                    Dışa Aktarım
                  </h2>
                  <p
                    className={cx(
                      "text-xs mt-0.5",
                      isDark ? "text-zinc-500" : "text-zinc-400"
                    )}
                  >
                    {filteredDepartments.length} departman · {selectedRange} verisi
                  </p>
                </div>
                <Download size={14} className="text-zinc-400" />
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[
                  {
                    label: "PDF İndir",
                    icon: Download,
                    fn: downloadPDF,
                    primary: true,
                  },
                  {
                    label: "Excel",
                    icon: FileSpreadsheet,
                    fn: downloadCSV,
                    primary: false,
                  },
                  {
                    label: "E-posta",
                    icon: Mail,
                    fn: sendMailReport,
                    primary: false,
                  },
                ].map((btn) => (
                  <button
                    key={btn.label}
                    onClick={btn.fn}
                    className={cx(
                      "flex flex-col items-center gap-1.5 rounded-lg py-3 px-2 text-xs font-semibold border transition-all",
                      btn.primary
                        ? "bg-[#E61A21] border-[#E61A21] text-white hover:opacity-90"
                        : isDark
                        ? "bg-white/[0.04] border-white/[0.08] text-zinc-300 hover:bg-white/[0.08]"
                        : "bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100"
                    )}
                  >
                    <btn.icon size={16} />
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Report Stats */}
            <div
              className={cx(
                "rounded-xl border px-5 py-4",
                isDark
                  ? "bg-[#111] border-white/[0.07]"
                  : "bg-white border-zinc-200 shadow-sm"
              )}
            >
              <div
                className={cx(
                  "flex items-center justify-between pb-3.5 mb-3.5 border-b",
                  isDark ? "border-white/[0.07]" : "border-zinc-100"
                )}
              >
                <div>
                  <h2
                    className={cx(
                      "text-sm font-semibold",
                      isDark ? "text-white" : "text-zinc-900"
                    )}
                  >
                    Rapor İstatistikleri
                  </h2>
                  <p
                    className={cx(
                      "text-xs mt-0.5",
                      isDark ? "text-zinc-500" : "text-zinc-400"
                    )}
                  >
                    Dönem özeti
                  </p>
                </div>
                <Activity size={14} className="text-zinc-400" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                {[
                  {
                    label: "Toplam Rapor",
                    val: reportStats.totalReports,
                    icon: Activity,
                  },
                  {
                    label: "İndirilen",
                    val: reportStats.downloaded,
                    icon: Download,
                  },
                  {
                    label: "Bugün Oluşturulan",
                    val: reportStats.generatedToday,
                    icon: CalendarDays,
                  },
                  {
                    label: "AI Destekli",
                    val: reportStats.aiGenerated,
                    icon: Brain,
                  },
                ].map((s) => (
                  <div
                    key={s.label}
                    className={cx(
                      "rounded-lg px-3 py-2.5 flex items-center justify-between gap-2",
                      isDark ? "bg-white/[0.04]" : "bg-zinc-50"
                    )}
                  >
                    <div>
                      <p
                        className={cx(
                          "text-[10px] font-medium",
                          isDark ? "text-zinc-600" : "text-zinc-400"
                        )}
                      >
                        {s.label}
                      </p>
                      <p
                        className={cx(
                          "text-base font-bold tabular-nums mt-0.5",
                          isDark ? "text-white" : "text-zinc-900"
                        )}
                      >
                        {s.val}
                      </p>
                    </div>
                    <s.icon
                      size={16}
                      className={isDark ? "text-zinc-600" : "text-zinc-300"}
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>

        </div>
      )}
    </YoneticiLayout>
  );
}