import { useEffect, useState } from "react";
import EgitmenLayout from "../../components/egitmen/EgitmenLayout";
import RoleMessageCenter from "../../components/communication/RoleMessageCenter";
import {
  IconSpeakerphone,
  IconCheck,
  IconBuilding,
  IconBell,
  IconSearch,
  IconFilter,
  IconRefresh,
  IconTrash,
  IconSend,
  IconLoader2,
  IconPencil,
  IconAlignLeft,
  IconChevronRight,
} from "@tabler/icons-react";

// ── shared primitives ─────────────────────────────────────────────────
const inputCls = (isDark) =>
  `w-full rounded-xl px-4 py-3 border outline-none text-sm font-semibold transition-all duration-200
  ${isDark
    ? "bg-white/[0.03] border-white/10 text-white placeholder:text-zinc-600 focus:border-[#E61A21]/50 focus:bg-white/[0.06]"
    : "bg-zinc-50 border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus:border-[#E61A21]/50 focus:bg-white"}`;

const selectCls = (isDark) =>
  `w-full rounded-xl px-4 py-3 border outline-none text-sm font-semibold transition-all duration-200
  ${isDark
    ? "bg-white/[0.03] border-white/10 text-white focus:border-[#E61A21]/50"
    : "bg-zinc-50 border-zinc-200 text-zinc-900 shadow-sm focus:border-[#E61A21]/50"}`;

const textareaCls = (isDark) =>
  `w-full rounded-xl px-4 py-3 border outline-none text-sm font-semibold resize-none transition-all duration-200 min-h-[120px]
  ${isDark
    ? "bg-white/[0.03] border-white/10 text-white placeholder:text-zinc-600 focus:border-[#E61A21]/50"
    : "bg-zinc-50 border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus:border-[#E61A21]/50"}`;

// ── KPI card ──────────────────────────────────────────────────────────
function KpiCard({ isDark, accent, icon: Icon, label, value, small }) {
  return (
    <div
      style={{ borderLeft: `3px solid ${accent}` }}
      className={`rounded-[1.25rem] px-5 py-4 transition-all ${
        isDark
          ? "bg-white/[0.02] shadow-[0_0_0_1px_rgba(255,255,255,0.06)]"
          : "bg-white shadow-[0_2px_12px_rgba(0,0,0,0.07)]"
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon size={13} strokeWidth={2} style={{ color: accent }} aria-hidden="true" />
        <p className="text-[9px] font-black uppercase tracking-[0.25em] text-zinc-500">{label}</p>
      </div>
      {small ? (
        <p className={`text-sm font-black leading-tight truncate ${isDark ? "text-white" : "text-zinc-900"}`}>
          {value}
        </p>
      ) : (
        <p style={{ color: accent }} className="text-3xl font-black tabular-nums">{value}</p>
      )}
    </div>
  );
}

// ── dept badge ────────────────────────────────────────────────────────
function DeptBadge({ dept, isDark }) {
  const colorMap = {
    All:   "#E61A21",
    IT:    "#3B82F6",
    HR:    "#22C55E",
    Sales: "#F59E0B",
  };
  const color = colorMap[dept] || "#8B5CF6";
  return (
    <span
      style={{ backgroundColor: `${color}12`, color }}
      className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg"
    >
      {dept === "All" ? "Tüm Departmanlar" : dept}
    </span>
  );
}

// ── time helper ───────────────────────────────────────────────────────
function timeAgo(dateStr) {
  if (!dateStr) return "—";
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 60000);
  if (diff < 1)    return "az önce";
  if (diff < 60)   return `${diff} dk önce`;
  if (diff < 1440) return `${Math.floor(diff / 60)} sa önce`;
  return new Date(dateStr).toLocaleDateString("tr-TR");
}

// ── main ──────────────────────────────────────────────────────────────
export default function Duyurular() {
  // ── state — كودك الأصلي ──
  const [announcements, setAnnouncements] = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [search,        setSearch]        = useState("");
  const [filterDept,    setFilterDept]    = useState("All");

  const [formData, setFormData] = useState({
  title: "",
  content: "",
  target_dept: "All",

  target_role: "kullanici",
  type: "egitim",
  priority: "normal",

  sender_role: "Eğitmen",
  sender_name: "Eğitmen",
});

  // ── filteredAnnouncements — أصلي ──
  const filteredAnnouncements = announcements.filter((item) => {
    const matchesDept = filterDept === "All" || item.target_dept === filterDept;
    const text = `${item.title} ${item.content} ${item.target_dept}`.toLowerCase();
    return matchesDept && text.includes(search.toLowerCase());
  });

  useEffect(() => { fetchAnnouncements(); }, []);

  // ── fetchAnnouncements — أصلي ──
  async function fetchAnnouncements() {
    setLoading(true);
    try {
      const res  = await fetch("/api/egitmen/announcements");
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.message || "Duyurular alınamadı");
      setAnnouncements(json.rows || []);
    } catch (err) {
      console.error("Duyuru listeleme hatası:", err);
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  }

  // ── handleChange — أصلي ──
  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  // ── handleSubmit — أصلي ──
  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const res = await fetch("/api/duyurular/create", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
  ...formData,

  description: formData.content,

  pinned: false,

  module: "egitmen",

  sender_role: "Eğitmen",

  sender_name:
    localStorage.getItem("userName") || "Eğitmen",
}),
      });
      const json = await res.json();
      if (!res.ok || !(json.ok || json.success)) {
  throw new Error(json.message || "Duyuru eklenemedi");
}
      alert("Duyuru eklendi!");
      setFormData({
  title: "",
  content: "",
  target_dept: "All",

  target_role: "kullanici",
  type: "egitim",
  priority: "normal",

  sender_role: "Eğitmen",

  sender_name:
    localStorage.getItem("userName") || "Eğitmen",
});
      fetchAnnouncements();
    } catch (err) {
      console.error("Duyuru ekleme hatası:", err);
      alert(err.message);
    }
    fetchAnnouncements();
  }

  // ── handleDelete — أصلي ──
  async function handleDelete(id) {
    const confirmDelete = confirm("Silmek istediğine emin misin?");
    if (!confirmDelete) return;
    try {
      const res  = await fetch("/api/egitmen/delete-announcement", {
        method: "DELETE", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.message || "Duyuru silinemedi");
      setAnnouncements((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Duyuru silme hatası:", err);
      alert("Duyuru silinemedi!");
    }
    fetchAnnouncements();
  }

  return (
    <EgitmenLayout
      pageTitle="Duyurular"
      pageSubtitle="Yeni duyuru oluştur ve tüm kullanıcılara ilet"
    >
      {({ isDark }) => (
        <>
          {/* ══════════════════════════════════════
              ① STATS BAR
          ══════════════════════════════════════ */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <KpiCard isDark={isDark} accent="#E61A21" icon={IconSpeakerphone}
              label="Toplam"    value={announcements.length} />
            <KpiCard isDark={isDark} accent="#22C55E" icon={IconCheck}
              label="Aktif"     value={announcements.filter((a) => a.status === "active").length} />
            <KpiCard isDark={isDark} accent="#3B82F6" icon={IconBuilding}
              label="Departman" value={[...new Set(announcements.map((a) => a.target_dept))].length} />
            <KpiCard isDark={isDark} accent="#F59E0B" icon={IconBell}
              label="Son Duyuru" value={announcements[0]?.title || "—"} small />
          </div>

          {/* ══════════════════════════════════════
              ② SEARCH + FILTER
          ══════════════════════════════════════ */}
          <div
            className={`mb-6 rounded-[1.5rem] p-4 flex flex-col md:flex-row gap-3 md:items-center ${
              isDark
                ? "bg-white/[0.02] shadow-[0_0_0_1px_rgba(255,255,255,0.06)]"
                : "bg-white shadow-[0_2px_16px_rgba(0,0,0,0.07)]"
            }`}
          >
            {/* Search */}
            <div className="relative flex-1">
              <IconSearch size={15} strokeWidth={2}
                className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? "text-zinc-500" : "text-zinc-400"}`}
                aria-hidden="true" />
              <input
                type="text"
                placeholder="Duyuru ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`${inputCls(isDark)} pl-10`}
              />
            </div>

            {/* Dept filter */}
            <div className="relative md:w-56">
              <IconFilter size={14} strokeWidth={2}
                className={`absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none ${isDark ? "text-zinc-500" : "text-zinc-400"}`}
                aria-hidden="true" />
              <select
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
                className={`${selectCls(isDark)} pl-9`}
              >
                <option value="All">Tüm Departmanlar</option>
                <option value="IT">IT</option>
                <option value="HR">HR</option>
                <option value="Sales">Sales</option>
              </select>
            </div>

            {/* Refresh */}
            <button
              type="button"
              onClick={fetchAnnouncements}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#E61A21] text-white font-black text-[11px] uppercase tracking-widest transition-all duration-200 hover:-translate-y-[2px] hover:shadow-lg hover:shadow-red-900/30 shrink-0"
            >
              <IconRefresh size={15} strokeWidth={2}
                className={loading ? "animate-spin" : ""} aria-hidden="true" />
              Yenile
            </button>
          </div>

          {/* ══════════════════════════════════════
              ③ CREATE FORM
          ══════════════════════════════════════ */}
          <div
            style={{ borderTop: "3px solid #E61A21" }}
            className={`mb-8 rounded-[1.5rem] p-6 ${
              isDark
                ? "bg-white/[0.02] shadow-[0_0_0_1px_rgba(255,255,255,0.06)]"
                : "bg-white shadow-[0_2px_16px_rgba(0,0,0,0.07)]"
            }`}
          >
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <span className="w-8 h-8 rounded-lg bg-[#E61A21]/10 flex items-center justify-center shrink-0">
                <IconSpeakerphone size={16} strokeWidth={1.75} className="text-[#E61A21]" aria-hidden="true" />
              </span>
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#E61A21]">
                  Duyuru Merkezi
                </p>
                <h3 className={`text-base font-black italic uppercase ${isDark ? "text-white" : "text-zinc-900"}`}>
                  Yeni Duyuru Oluştur
                </h3>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <IconPencil size={12} strokeWidth={2} className="text-[#E61A21]" aria-hidden="true" />
                  <p className="text-[9px] font-black uppercase tracking-[0.25em] text-zinc-500">Duyuru Başlığı</p>
                </div>
                <input
                  type="text"
                  name="title"
                  placeholder="Örn: Yeni Eğitim Müfredatı Yayınlandı"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className={inputCls(isDark)}
                />
              </div>

              {/* Content */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <IconAlignLeft size={12} strokeWidth={2} className="text-[#3B82F6]" aria-hidden="true" />
                  <p className="text-[9px] font-black uppercase tracking-[0.25em] text-zinc-500">Duyuru İçeriği</p>
                </div>
                <textarea
                  name="content"
                  placeholder="Detaylı açıklama yaz..."
                  value={formData.content}
                  onChange={handleChange}
                  required
                  className={textareaCls(isDark)}
                />
              </div>

              {/* Target dept */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <IconBuilding size={12} strokeWidth={2} className="text-[#22C55E]" aria-hidden="true" />
                  <p className="text-[9px] font-black uppercase tracking-[0.25em] text-zinc-500">Hedef Departman</p>
                </div>
                <select
                  name="target_dept"
                  value={formData.target_dept}
                  onChange={handleChange}
                  className={selectCls(isDark)}
                >
                  <option value="All">Tüm Departmanlar</option>
                  <option value="IT">IT</option>
                  <option value="HR">HR</option>
                  <option value="Sales">Sales</option>
                </select>

                <div>
  <div className="flex items-center gap-2 mb-2">
    <IconBell
      size={12}
      strokeWidth={2}
      className="text-[#F59E0B]"
    />
    <p className="text-[9px] font-black uppercase tracking-[0.25em] text-zinc-500">
      Duyuru Türü
    </p>
  </div>

  <select
    name="type"
    value={formData.type}
    onChange={handleChange}
    className={selectCls(isDark)}
  >
    <option value="egitim">Eğitim</option>
    <option value="sinav">Sınav</option>
    <option value="acil">Acil</option>
    <option value="basari">Başarı</option>
    <option value="sistem">Sistem</option>
  </select>
</div>

              </div>

              {/* Submit */}
              <button
                type="submit"
                className="group w-full flex items-center justify-between rounded-xl bg-[#E61A21] px-6 py-4 text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-red-900/30"
              >
                <div className="flex items-center gap-3">
                  <IconSend size={16} strokeWidth={2} aria-hidden="true" />
                  <span className="font-black text-[11px] uppercase tracking-widest">
                    Duyuru Oluştur
                  </span>
                </div>
                <IconChevronRight
                  size={16} strokeWidth={2}
                  className="opacity-60 group-hover:translate-x-1 transition-transform duration-200"
                  aria-hidden="true"
                />
              </button>
            </form>
          </div>

          <RoleMessageCenter
  isDark={isDark}
  role="egitmen"
  roleLabel="Eğitmen"
/>

          {/* ══════════════════════════════════════
              ④ ANNOUNCEMENTS LIST
          ══════════════════════════════════════ */}
          {loading ? (
            <div className="flex items-center justify-center gap-3 py-20">
              <IconLoader2 size={22} strokeWidth={1.75} className="animate-spin text-[#E61A21]" aria-hidden="true" />
              <span className={`text-sm font-bold ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>
                Yükleniyor...
              </span>
            </div>
          ) : filteredAnnouncements.length === 0 ? (
            <div className={`rounded-[1.5rem] p-12 text-center ${
              isDark
                ? "bg-white/[0.02] shadow-[0_0_0_1px_rgba(255,255,255,0.06)]"
                : "bg-white shadow-[0_2px_16px_rgba(0,0,0,0.07)]"
            }`}>
              <IconSpeakerphone size={40} strokeWidth={1} className="mx-auto mb-3 text-zinc-300" aria-hidden="true" />
              <p className={`text-sm font-bold ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>
                Henüz duyuru yok
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAnnouncements.map((item, idx) => {
                const deptColorMap = { All: "#E61A21", IT: "#3B82F6", HR: "#22C55E", Sales: "#F59E0B" };
                const accent = deptColorMap[item.target_dept] || "#8B5CF6";

                return (
                  <div
                    key={item.id}
                    style={{ borderLeft: `3px solid ${accent}` }}
                    className={`rounded-r-[1.5rem] rounded-l-sm p-5 transition-all duration-200 hover:-translate-y-[2px] ${
                      isDark
                        ? "bg-white/[0.02] shadow-[0_0_0_1px_rgba(255,255,255,0.06)] hover:bg-white/[0.04] hover:shadow-[0_0_0_1px_rgba(255,255,255,0.1)]"
                        : "bg-white shadow-[0_2px_16px_rgba(0,0,0,0.07)] hover:shadow-[0_6px_24px_rgba(0,0,0,0.1)]"
                    }`}
                  >
                    {/* Header row */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-start gap-3">
                        {/* Number badge */}
                        <div
                          style={{ backgroundColor: `${accent}15`, color: accent }}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-black shrink-0 mt-0.5"
                        >
                          {idx + 1}
                        </div>

                        <div>
                          <h3 className={`text-base font-black italic uppercase leading-tight ${
                            isDark ? "text-white" : "text-zinc-900"
                          }`}>
                            {item.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            <DeptBadge dept={item.target_dept} isDark={isDark} />
                            {item.status && (
                              <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg ${
                                item.status === "active"
                                  ? "bg-green-500/10 text-green-500"
                                  : "bg-zinc-500/10 text-zinc-400"
                              }`}>
                                {item.status === "active" ? "Aktif" : item.status}
                              </span>
                            )}
                            <span className={`text-[10px] font-bold ${isDark ? "text-zinc-600" : "text-zinc-400"}`}>
                              {timeAgo(item.created_at)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/10 text-red-500 font-black text-[10px] uppercase tracking-widest hover:bg-red-500/20 transition-all shrink-0"
                      >
                        <IconTrash size={13} strokeWidth={2} aria-hidden="true" />
                        Sil
                      </button>
                    </div>

                    {/* Content */}
                    <div
                      className={`rounded-xl px-4 py-3 ${
                        isDark ? "bg-white/[0.03]" : "bg-zinc-50"
                      }`}
                    >
                      <p className={`text-sm font-semibold leading-relaxed ${
                        isDark ? "text-zinc-300" : "text-zinc-600"
                      }`}>
                        {item.content}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </EgitmenLayout>
  );
}