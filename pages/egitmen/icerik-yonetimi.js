import { useEffect, useMemo, useState } from "react";
import EgitmenLayout from "../../components/egitmen/EgitmenLayout";
import { supabase } from "../../lib/supabaseClient";
import {
  IconFolders,
  IconSparkles,
  IconRefresh,
  IconBooks,
  IconCheck,
  IconPlayerPause,
  IconVideo,
  IconFileText,
  IconSearch,
  IconFilter,
  IconPencil,
  IconTrash,
  IconEye,
  IconEyeOff,
  IconX,
  IconLoader2,
  IconFileInfo,
  IconAlertTriangle,
  IconLayoutGrid,
  IconTable,
  IconCloudUpload,
  IconFile,
  IconFileTypePdf,
  IconMovie,
  IconChevronRight,
  IconToggleLeft,
  IconToggleRight,
} from "@tabler/icons-react";

// ─── shared primitives ───────────────────────────────────────────────
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

const textareaCls = (isDark) =>
  `w-full rounded-xl px-4 py-3 border outline-none text-sm font-semibold resize-none transition-all duration-200
  ${isDark
    ? "bg-white/[0.03] border-white/10 text-white placeholder:text-zinc-600 focus:border-[#E61A21]/50"
    : "bg-zinc-50 border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus:border-[#E61A21]/50"}`;

function SBox({ isDark, accent = "#E61A21", icon: Icon, label, tag, action, children }) {
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
        <p style={{ color: accent }} className="text-[9px] font-black uppercase tracking-[0.3em] flex-1">
          {label}
        </p>
        {tag && (
          <span style={{ backgroundColor: `${accent}12`, color: accent }}
            className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg shrink-0">
            {tag}
          </span>
        )}
        {action}
      </div>
      {children}
    </div>
  );
}

// ─── stat card ───────────────────────────────────────────────────────
function StatCard({ isDark, accent, icon: Icon, label, value, onClick, active }) {
  return (
    <button
      onClick={onClick}
      style={{ borderLeft: `3px solid ${active ? accent : "transparent"}`, transition: "border-color 0.2s" }}
      className={`rounded-[1rem] px-4 py-4 text-left transition-all duration-200 hover:-translate-y-[2px] ${
        active
          ? isDark
            ? "bg-white/[0.06] shadow-[0_0_0_1px_rgba(255,255,255,0.12)]"
            : "bg-white shadow-[0_4px_16px_rgba(0,0,0,0.1)]"
          : isDark
          ? "bg-white/[0.02] shadow-[0_0_0_1px_rgba(255,255,255,0.06)] hover:bg-white/[0.04]"
          : "bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:shadow-md"
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon size={13} strokeWidth={2} style={{ color: accent }} aria-hidden="true" />
        <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500">{label}</p>
      </div>
      <p style={{ color: active ? accent : undefined }}
        className={`text-2xl font-black tabular-nums ${isDark && !active ? "text-white" : !isDark && !active ? "text-zinc-900" : ""}`}>
        {value}
      </p>
    </button>
  );
}

// ─── badge ───────────────────────────────────────────────────────────
function StatusBadge({ aktif }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
      aktif ? "bg-green-500/10 text-green-500" : "bg-zinc-500/10 text-zinc-400"
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${aktif ? "bg-green-500" : "bg-zinc-400"}`} />
      {aktif ? "Yayında" : "Taslak"}
    </span>
  );
}

function ContentBadge({ ok, label }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ${
      ok ? "bg-zinc-500/10 text-zinc-400" : "bg-red-500/10 text-red-500"
    }`}>
      {ok
        ? <IconCheck size={10} strokeWidth={2.5} aria-hidden="true" />
        : <IconAlertTriangle size={10} strokeWidth={2.5} aria-hidden="true" />}
      {label}
    </span>
  );
}

// ─── filter pill ─────────────────────────────────────────────────────
function FilterPill({ active, onClick, label, isDark }) {
  return (
    <button onClick={onClick}
      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-200 ${
        active
          ? "bg-[#E61A21] text-white shadow-lg shadow-red-900/20 -translate-y-[2px]"
          : isDark
          ? "bg-white/[0.04] text-zinc-400 hover:bg-white/[0.08] hover:text-white"
          : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900"
      }`}>
      {label}
    </button>
  );
}

// ─── main component ──────────────────────────────────────────────────
export default function IcerikYonetimi() {
  const [contents, setContents]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [filter, setFilter]       = useState("all");
  const [selected, setSelected]   = useState(null);
  const [courseLessons, setCourseLessons] = useState([]);
  const [saving, setSaving]       = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiReport, setAiReport]   = useState("");
  const [viewMode, setViewMode]   = useState("grid"); // "grid" | "table"
  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [uploadingField, setUploadingField] = useState(null);

  useEffect(() => {
    fetchContents();
    fetchMediaFiles();
  }, []);

  // ── fetchContents — أصلي ──
  async function fetchContents() {
    setLoading(true);
    const { data, error } = await supabase
      .from("courses_data")
      .select("*")
      .order("id", { ascending: false })
    if (error) alert("İçerikler alınamadı: " + error.message);
    else setContents(data || []);
    setLoading(false);
  }

  // ── fetchMediaFiles — جديد ──
  async function fetchMediaFiles() {
  setMediaLoading(true);

  const { data, error } = await supabase.storage
    .from("training-files")
    .list("trainings", {
      limit: 100,
      sortBy: { column: "created_at", order: "desc" },
    });

  if (error) {
    console.log("Media files error:", error.message);
    setMediaFiles([]);
  } else {
    setMediaFiles(data || []);
  }

  setMediaLoading(false);
}

  // ── toggleActive — أصلي ──
  async function toggleActive(item) {
  const newStatus = !item.is_active;

  const res = await fetch("/api/egitmen/toggle-course-status", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: item.id,
      is_active: newStatus,
    }),
  });

  const data = await res.json();

  if (!data.ok) {
    alert("Durum değiştirilemedi");
    return;
  }

  setContents((prev) =>
    prev.map((x) =>
      x.id === item.id ? data.course : x
    )
  );
}

  // ── deleteContent — أصلي ──
  async function deleteContent(id) {
  if (!confirm("Bu içeriği silmek istediğine emin misin?")) return;

  const res = await fetch("/api/egitmen/delete-course", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ course_id: id }),
  });

  const data = await res.json();

  if (!data.ok) {
    alert("Silinemedi: " + data.message);
    return;
  }

  setContents((prev) => prev.filter((x) => x.id !== id));
}

    async function fetchLessons(courseId) {
  const { data, error } = await supabase
    .from("course_lessons")
    .select("*")
    .eq("course_id", courseId)
    .order("lesson_order", { ascending: true });

  if (!error) {
    setCourseLessons(data || []);
  }
}

  // ── saveEdit — أصلي ──
  async function saveEdit(e) {
  e.preventDefault();
  if (!selected) return;

  setSaving(true);

  const res = await fetch("/api/egitmen/update-course", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      course_id: selected.id,
      course: selected,
      lessons: courseLessons,
    }),
  });

  const data = await res.json();

  setSaving(false);

  if (!data.ok) {
    alert("Güncellenemedi: " + data.message);
    return;
  }

  setContents((prev) =>
    prev.map((x) => (x.id === selected.id ? data.course : x))
  );

  setSelected(null);
  alert("İçerik güncellendi!");
}

  // ── analyzeWithAI — أصلي ──
  async function analyzeWithAI() {
    if (contents.length === 0) { alert("Analiz için önce içerik olmalı."); return; }
    setAiLoading(true);
    setAiReport("");
    try {
      const summary = contents.map((x) =>
        `ID:${x.id} | Başlık:${x.title || "Yok"} | Açıklama:${x.description || "Yok"} | Video:${x.cover_url ? "Var" : "Yok"} | Durum:${x.is_active ? "Aktif" : "Pasif"}`
      ).join("\n");
      const res = await fetch("/api/gemini", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: `Aşağıdaki eğitim içeriklerini analiz et. Eksikleri, güçlü yönleri ve geliştirme önerilerini Türkçe ve maddeler halinde yaz:\n\n${summary}` }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "AI analiz hatası");
      setAiReport(data.reply);
    } catch (err) {
      setAiReport("AI analiz alınamadı: " + err.message);
    } finally {
      setAiLoading(false);
    }
  }

  // ── stats — أصلي ──
  const stats = useMemo(() => ({
    total:        contents.length,
    active:       contents.filter((x) => x.is_active).length,
    passive:      contents.filter((x) => !x.is_active).length,
    missingVideo: contents.filter((x) => !x.cover_url).length,
    missingDesc:  contents.filter((x) => !x.description).length,
  }), [contents]);

  // ── filter — أصلي ──
  const filtered = contents.filter((item) => {
    const text = `${item.title || ""} ${item.description
      || ""}`.toLowerCase();
    const matchSearch = text.includes(search.toLowerCase());
    const matchFilter =
      filter === "all" ||
      (filter === "active"       && item.is_active)    ||
      (filter === "passive"      && !item.is_active)   ||
      (filter === "missingVideo" && !item.cover_url)  ||
      (filter === "missingDesc"  && !item.description);
    return matchSearch && matchFilter;
  });

  // ── file size helper ──
  function fmtSize(bytes) {
    if (!bytes) return "—";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  function fileIcon(name = "") {
    const ext = name.split(".").pop().toLowerCase();
    if (["mp4", "mov", "avi", "webm"].includes(ext)) return <IconMovie size={16} strokeWidth={1.75} className="text-blue-500" />;
    if (ext === "pdf") return <IconFileTypePdf size={16} strokeWidth={1.75} className="text-red-500" />;
    return <IconFile size={16} strokeWidth={1.75} className="text-zinc-400" />;
  }

  function getYoutubeId(url) {
  if (!url) return null;

  if (url.includes("v=")) {
    return url.split("v=")[1]?.split("&")[0];
  }

  if (url.includes("youtu.be/")) {
    return url.split("youtu.be/")[1]?.split("?")[0];
  }

  if (url.includes("/embed/")) {
    return url.split("/embed/")[1]?.split("?")[0];
  }

  return url;
}

async function uploadCourseFile(file, fieldName) {
  if (!file || !selected) return;

  setUploadingField(fieldName);

  const fd = new FormData();
  fd.append("file", file);

  const res = await fetch("/api/organizasyon/upload-training-file", {
    method: "POST",
    body: fd,
  });

  const data = await res.json();

  setUploadingField(null);

  if (!data.ok) {
    alert(data.message || "Dosya yüklenemedi.");
    return;
  }

  setSelected((prev) => ({
    ...prev,
    [fieldName]: data.url,
  }));

  alert("Dosya yüklendi ✓");
}

async function deleteMediaFile(fileName) {
  if (!confirm("Bu dosyayı silmek istediğine emin misin?")) return;

  const res = await fetch("/api/egitmen/delete-media-file", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fileName }),
  });

  const data = await res.json();

  if (!data.ok) {
    alert("Dosya silinemedi: " + data.message);
    return;
  }

  setMediaFiles((prev) => prev.filter((f) => f.name !== fileName));
}

  return (
    <EgitmenLayout showTopbar={false}>
      {({ isDark }) => (
        <div className="space-y-6">

          {/* ══════════════════════════════════════
              HEADER
          ══════════════════════════════════════ */}
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#E61A21]/10 flex items-center justify-center shrink-0">
                <IconFolders size={24} strokeWidth={1.75} className="text-[#E61A21]" aria-hidden="true" />
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#E61A21] mb-1">
                  Content Control Center
                </p>
                <h1 className={`text-3xl md:text-4xl font-black italic uppercase tracking-tight ${isDark ? "text-white" : "text-zinc-900"}`}>
                  İçerik Yönetimi
                </h1>
                <p className={`mt-1 text-sm font-semibold ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
                  Eğitim içeriklerini kontrol et, düzenle, eksikleri gör ve AI ile analiz et.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={analyzeWithAI}
                disabled={aiLoading}
                className={`flex items-center gap-2 px-5 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all duration-200 hover:-translate-y-[2px] disabled:opacity-50 ${
                  isDark ? "bg-white text-black hover:shadow-xl" : "bg-zinc-900 text-white hover:shadow-xl"
                }`}
              >
                {aiLoading
                  ? <IconLoader2 size={15} strokeWidth={2} className="animate-spin" aria-hidden="true" />
                  : <IconSparkles size={15} strokeWidth={2} aria-hidden="true" />
                }
                {aiLoading ? "Analiz Ediliyor..." : "AI Analiz Et"}
              </button>

              <button
                onClick={fetchContents}
                className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-[#E61A21] text-white font-black text-xs uppercase tracking-widest transition-all duration-200 hover:-translate-y-[2px] hover:shadow-lg hover:shadow-red-900/30"
              >
                <IconRefresh size={15} strokeWidth={2} aria-hidden="true" />
                Yenile
              </button>
            </div>
          </div>

          {/* ══════════════════════════════════════
              ① STATS BAR — clickable filters
          ══════════════════════════════════════ */}
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4">
            {[
              { label: "Toplam",        value: stats.total,        icon: IconBooks,       accent: "#E61A21", key: "all"          },
              { label: "Yayında",       value: stats.active,       icon: IconCheck,       accent: "#22C55E", key: "active"       },
              { label: "Taslak",        value: stats.passive,      icon: IconPlayerPause, accent: "#F59E0B", key: "passive"      },
              { label: "Videosuz",      value: stats.missingVideo, icon: IconVideo,       accent: "#3B82F6", key: "missingVideo" },
              { label: "Açıklamasız",  value: stats.missingDesc,  icon: IconFileText,    accent: "#8B5CF6", key: "missingDesc"  },
            ].map((s) => (
              <StatCard key={s.key} isDark={isDark} accent={s.accent} icon={s.icon}
                label={s.label} value={s.value} active={filter === s.key}
                onClick={() => setFilter(filter === s.key ? "all" : s.key)} />
            ))}
          </div>

          {/* ══════════════════════════════════════
              AI REPORT — أصلي + نفس ستايلنا
          ══════════════════════════════════════ */}
          {aiReport && (
            <div
              style={{ borderTop: "3px solid #8B5CF6" }}
              className={`rounded-[1.5rem] p-6 ${
                isDark ? "bg-white/[0.02] shadow-[0_0_0_1px_rgba(255,255,255,0.06)]" : "bg-white shadow-[0_2px_16px_rgba(0,0,0,0.07)]"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <IconSparkles size={16} strokeWidth={1.75} className="text-purple-500" aria-hidden="true" />
                  </span>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-500">
                    AI İçerik Analizi
                  </p>
                </div>
                <button
                  onClick={() => setAiReport("")}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                    isDark ? "hover:bg-white/[0.08] text-zinc-400" : "hover:bg-zinc-100 text-zinc-500"
                  }`}
                >
                  <IconX size={14} strokeWidth={2} aria-hidden="true" />
                </button>
              </div>
              <div className={`whitespace-pre-wrap text-sm leading-7 font-medium ${isDark ? "text-zinc-300" : "text-zinc-600"}`}>
                {aiReport}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════
              ② SEARCH + FILTERS + VIEW TOGGLE
          ══════════════════════════════════════ */}
          <div
            className={`rounded-[1.5rem] p-5 ${
              isDark ? "bg-white/[0.02] shadow-[0_0_0_1px_rgba(255,255,255,0.06)]" : "bg-white shadow-[0_2px_16px_rgba(0,0,0,0.07)]"
            }`}
          >
            <div className="flex gap-3 mb-4">
              <div className="relative flex-1">
                <IconSearch size={15} strokeWidth={2}
                  className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? "text-zinc-500" : "text-zinc-400"}`}
                  aria-hidden="true" />
                <input
                  value={search} onChange={(e) => setSearch(e.target.value)}
                  placeholder="İçerik ara... başlık veya açıklama"
                  className={`${inputCls(isDark)} pl-10`}
                />
              </div>
              {/* View toggle */}
              <div className={`flex rounded-xl overflow-hidden border ${isDark ? "border-white/10" : "border-zinc-200"}`}>
                {[
                  { mode: "grid",  Icon: IconLayoutGrid },
                  { mode: "table", Icon: IconTable      },
                ].map(({ mode, Icon }) => (
                  <button key={mode} type="button" onClick={() => setViewMode(mode)}
                    className={`w-11 flex items-center justify-center transition-all ${
                      viewMode === mode
                        ? "bg-[#E61A21] text-white"
                        : isDark ? "text-zinc-500 hover:text-white" : "text-zinc-400 hover:text-zinc-900"
                    }`}>
                    <Icon size={16} strokeWidth={1.75} aria-hidden="true" />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                { key: "all",          label: "Hepsi"        },
                { key: "active",       label: "Yayında"      },
                { key: "passive",      label: "Taslak"       },
                { key: "missingVideo", label: "Videosuz"     },
                { key: "missingDesc",  label: "Açıklamasız"  },
              ].map((f) => (
                <FilterPill key={f.key} isDark={isDark} active={filter === f.key}
                  onClick={() => setFilter(f.key)} label={f.label} />
              ))}
            </div>
          </div>

          {/* ══════════════════════════════════════
              ③ CONTENT LIST — grid or table
          ══════════════════════════════════════ */}
          {loading ? (
            <div className="flex items-center justify-center gap-3 py-20">
              <IconLoader2 size={22} strokeWidth={1.75} className="animate-spin text-[#E61A21]" aria-hidden="true" />
              <span className={`text-sm font-bold ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>
                Yükleniyor...
              </span>
            </div>
          ) : filtered.length === 0 ? (
            <div
              className={`rounded-[1.5rem] p-12 text-center ${
                isDark ? "bg-white/[0.02] shadow-[0_0_0_1px_rgba(255,255,255,0.06)]" : "bg-white shadow-[0_2px_16px_rgba(0,0,0,0.07)]"
              }`}
            >
              <IconFolders size={48} strokeWidth={1} className="mx-auto mb-4 text-zinc-300" aria-hidden="true" />
              <h2 className={`text-xl font-black mb-2 ${isDark ? "text-white" : "text-zinc-900"}`}>
                İçerik bulunamadı
              </h2>
              <p className={`text-sm font-semibold ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>
                Yeni içerik eklemek için <b>Yeni Eğitim</b> bölümünü kullan.
              </p>
            </div>
          ) : viewMode === "grid" ? (
            /* ── GRID VIEW ── */
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              {filtered.map((item) => (
                <div
                  key={item.id}
                  style={{ borderTop: `3px solid ${item.is_active ? "#22C55E" : "#F59E0B"}` }}
                  className={`rounded-[1.5rem] overflow-hidden transition-all duration-300 hover:-translate-y-1 ${
                    isDark
                      ? "bg-white/[0.02] shadow-[0_0_0_1px_rgba(255,255,255,0.06)] hover:shadow-[0_0_0_1px_rgba(255,255,255,0.1)]"
                      : "bg-white shadow-[0_2px_16px_rgba(0,0,0,0.07)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.12)]"
                  }`}
                >
                  <div className="grid grid-cols-1 md:grid-cols-[200px_1fr]">
                    {/* Thumbnail */}
                    <div className={`relative min-h-[180px] flex items-center justify-center overflow-hidden ${
                      isDark ? "bg-white/[0.04]" : "bg-zinc-100"
                    }`}>
                      {item.thumbnail_url || item.cover_url || item.video_url ? (
  <img
    src={
      item.thumbnail_url
        ? item.thumbnail_url
        : `https://img.youtube.com/vi/${
            getYoutubeId(item.video_url) || item.cover_url
          }/maxresdefault.jpg`
    }
                          alt={item.title}
                          className="w-full h-full object-cover hover:scale-105 transition-all duration-500"
                        />
                      ) : (
                        <IconVideo size={40} strokeWidth={1} className={isDark ? "text-zinc-700" : "text-zinc-300"} aria-hidden="true" />
                      )}
                      <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-lg text-[9px] font-black ${
                        isDark ? "bg-black/70 text-white" : "bg-white/90 text-zinc-900"
                      }`}>
                        #{item.id}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <StatusBadge aktif={item.is_active} />
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${
                          isDark ? "bg-white/[0.06] text-zinc-400" : "bg-zinc-100 text-zinc-500"
                        }`}>
                          {item.content_type || "video"}
                        </span>
                      </div>

                      <h2 className={`text-base font-black italic uppercase leading-tight mb-2 ${isDark ? "text-white" : "text-zinc-900"}`}>
                        {item.title || "Başlıksız Eğitim"}
                      </h2>

                      <p className={`text-[12px] font-semibold leading-relaxed line-clamp-2 mb-4 ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>
                        {item.description || "Açıklama eklenmemiş."}
                      </p>

                      {/* Content badges */}
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        <ContentBadge ok={!!item.cover_url} label={item.cover_url ? "Video Var" : "Video Eksik"} />
                        <ContentBadge ok={!!item.file_url || item.content_type !== "pdf"} label={item.file_url ? "PDF Var" : "PDF Yok"} />
                        <ContentBadge ok={!!item.description} label={item.description ? "Açıklama Var" : "Açıklama Eksik"} />
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-wrap gap-2">
                        <button onClick={async () => {
  setSelected(item);
  await fetchLessons(item.id);
}}
                          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-500/10 text-blue-500 font-black text-[10px] uppercase tracking-widest hover:bg-blue-500/20 transition-all">
                          <IconPencil size={13} strokeWidth={2} aria-hidden="true" />
                          Düzenle
                        </button>

                        {/* ── One-click status toggle ── */}
                        <button onClick={() => toggleActive(item)}
                          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                            item.is_active
                              ? "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20"
                              : "bg-green-500/10 text-green-500 hover:bg-green-500/20"
                          }`}>
                          {item.is_active
                            ? <IconToggleRight size={14} strokeWidth={2} aria-hidden="true" />
                            : <IconToggleLeft size={14} strokeWidth={2} aria-hidden="true" />
                          }
                          {item.is_active ? "Taslağa Al" : "Yayına Al"}
                        </button>

                        <button
  type="button"
  onClick={() => {
    const url =
      item.video_url ||
      item.file_url ||
      item.dosya_url ||
      item.cover_url;

    if (!url) {
      alert("Bu eğitim için açılacak video veya dosya bağlantısı yok.");
      return;
    }

    window.open(url, "_blank");
  }}
  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-purple-500/10 text-purple-500 font-black text-[10px] uppercase tracking-widest hover:bg-purple-500/20 transition-all"
>
  <IconEye size={13} strokeWidth={2} />
  Aç
</button>

                        <button onClick={() => deleteContent(item.id)}
                          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-500/10 text-red-500 font-black text-[10px] uppercase tracking-widest hover:bg-red-500/20 transition-all">
                          <IconTrash size={13} strokeWidth={2} aria-hidden="true" />
                          Sil
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* ── TABLE VIEW — جديد ── */
            <div
              style={{ borderTop: "3px solid #E61A21" }}
              className={`rounded-[1.5rem] overflow-hidden ${
                isDark ? "bg-white/[0.02] shadow-[0_0_0_1px_rgba(255,255,255,0.06)]" : "bg-white shadow-[0_2px_16px_rgba(0,0,0,0.07)]"
              }`}
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={`border-b text-[9px] font-black uppercase tracking-[0.2em] ${
                      isDark ? "border-white/[0.06] text-zinc-500" : "border-zinc-100 text-zinc-400"
                    }`}>
                      {["#", "Başlık", "Tür", "Durum", "İçerik", "İşlemler"].map((h) => (
                        <th key={h} className="text-left px-5 py-4">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((item, i) => (
                      <tr key={item.id}
                        className={`border-b transition-all ${
                          isDark
                            ? "border-white/[0.04] hover:bg-white/[0.03]"
                            : "border-zinc-50 hover:bg-zinc-50"
                        }`}>
                        <td className="px-5 py-4">
                          <span className={`text-[11px] font-black ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>
                            #{item.id}
                          </span>
                        </td>
                        <td className="px-5 py-4 max-w-[220px]">
                          <p className={`text-[13px] font-black truncate ${isDark ? "text-white" : "text-zinc-900"}`}>
                            {item.title || "Başlıksız"}
                          </p>
                          <p className={`text-[11px] font-medium truncate ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>
                            {item.description || "—"}
                          </p>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg ${
                            isDark ? "bg-white/[0.06] text-zinc-400" : "bg-zinc-100 text-zinc-500"
                          }`}>
                            {item.content_type || "video"}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <StatusBadge aktif={item.is_active} />
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex gap-1.5">
                            <ContentBadge ok={!!item.cover_url} label="Video" />
                            <ContentBadge ok={!!item.description} label="Açıklama" />
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <button onClick={async () => {
  setSelected(item);
  await fetchLessons(item.id);
}}
                              className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center hover:bg-blue-500/20 transition-all">
                              <IconPencil size={13} strokeWidth={2} aria-hidden="true" />
                            </button>
                            <button onClick={() => toggleActive(item)}
                              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                                item.is_active ? "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20" : "bg-green-500/10 text-green-500 hover:bg-green-500/20"
                              }`}>
                              {item.is_active ? <IconEyeOff size={13} strokeWidth={2} /> : <IconEye size={13} strokeWidth={2} />}
                            </button>

                            <button
  type="button"
  onClick={() => {
    const url =
      item.video_url ||
      item.file_url ||
      item.dosya_url ||
      item.cover_url;

    if (!url) {
      alert("Bu eğitim için açılacak video veya dosya bağlantısı yok.");
      return;
    }

    window.open(url, "_blank");
  }}
  className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center hover:bg-purple-500/20 transition-all"
>
  <IconEye size={13} strokeWidth={2} />
</button>

                            <button onClick={() => deleteContent(item.id)}
                              className="w-8 h-8 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500/20 transition-all">
                              <IconTrash size={13} strokeWidth={2} aria-hidden="true" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════
              ④ MEDIA LIBRARY — جديد
          ══════════════════════════════════════ */}
          <SBox isDark={isDark} accent="#3B82F6" icon={IconCloudUpload} label="Medya Kitaplığı"
            tag={`${mediaFiles.length} dosya`}
            action={
              <button onClick={fetchMediaFiles}
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-all text-zinc-400 hover:text-blue-500">
                <IconRefresh size={14} strokeWidth={2} aria-hidden="true" />
              </button>
            }
          >
            {mediaLoading ? (
              <div className="flex items-center gap-2 py-6 justify-center">
                <IconLoader2 size={18} className="animate-spin text-blue-500" aria-hidden="true" />
                <span className="text-xs font-bold text-zinc-500">Dosyalar yükleniyor...</span>
              </div>
            ) : mediaFiles.length === 0 ? (
              <div className={`flex items-center justify-center py-8 rounded-xl border-2 border-dashed ${
                isDark ? "border-white/[0.06]" : "border-zinc-200"
              }`}>
                <p className={`text-xs font-bold ${isDark ? "text-zinc-600" : "text-zinc-300"}`}>
                  Henüz dosya yüklenmemiş
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {mediaFiles.map((file) => (
                  <div
  key={file.name}
  onClick={() => {
    window.open(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/training-files/trainings/${file.name}`,
      "_blank"
    );
  }}
                    style={{ borderLeft: "3px solid #3B82F6" }}
                    className={`cursor-pointer flex items-center gap-3 px-4 py-3 rounded-r-xl rounded-l-sm transition-all ${
                      isDark ? "bg-white/[0.02] hover:bg-white/[0.04]" : "bg-zinc-50 hover:bg-blue-50/40"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                      {fileIcon(file.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-[12px] font-black truncate ${isDark ? "text-white" : "text-zinc-900"}`}>
                        {file.name}
                      </p>
                      <p className="text-[10px] font-bold text-zinc-500">
                        {fmtSize(file.metadata?.size)} · {file.name.split(".").pop().toUpperCase()}
                      </p>
                    </div>

                    <button
  type="button"
  onClick={(e) => {
    e.stopPropagation();
    deleteMediaFile(file.name);
  }}
  className="w-8 h-8 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500/20 transition-all"
>
  <IconTrash size={14} strokeWidth={2} />
</button>

                  </div>
                ))}
              </div>
            )}
          </SBox>

          {/* ══════════════════════════════════════
              EDIT MODAL — أصلي + نفس ستايلنا
          ══════════════════════════════════════ */}
          {selected && (
            <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setSelected(null)} />

              <form onSubmit={saveEdit}
                style={{ borderTop: "3px solid #E61A21" }}
                className={`relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-[1.5rem] shadow-2xl ${
  isDark ? "bg-[#141414]" : "bg-white"
}`}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-[#E61A21]/10 flex items-center justify-center">
                      <IconPencil size={15} strokeWidth={2} className="text-[#E61A21]" aria-hidden="true" />
                    </span>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#E61A21]">
                      İçerik Düzenle — #{selected.id}
                    </p>
                  </div>
                  <button type="button" onClick={() => setSelected(null)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                      isDark ? "hover:bg-white/[0.08] text-zinc-400" : "hover:bg-zinc-100 text-zinc-500"
                    }`}>
                    <IconX size={15} strokeWidth={2} aria-hidden="true" />
                  </button>
                </div>

                <div className="overflow-y-auto max-h-[70vh] p-7 space-y-4">
                  {/* Başlık */}
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.25em] text-zinc-500 mb-2">Eğitim Başlığı</p>
                    <input value={selected.title || ""}
onChange={(e) => setSelected({ ...selected, title: e.target.value })}
                      className={inputCls(isDark)} />
                  </div>

                  {/* Açıklama */}
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.25em] text-zinc-500 mb-2">Açıklama</p>
                    <textarea value={selected.description || ""}
                              onChange={(e) => setSelected({ ...selected, description: e.target.value })}
                      className={textareaCls(isDark)} />
                  </div>

                  {/* İçerik türü */}
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.25em] text-zinc-500 mb-2">İçerik Türü</p>
                    <select value={selected.content_type || "video"}
onChange={(e) => setSelected({ ...selected, content_type: e.target.value })}
                      className={selectCls(isDark)}>
                      <option value="video">Video</option>
                      <option value="pdf">PDF</option>
                    </select>
                  </div>

                  {/* PDF URL */}
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.25em] text-zinc-500 mb-2">PDF / Dosya URL</p>
                    <input value={selected.file_url || ""}
onChange={(e) => setSelected({ ...selected, file_url: e.target.value })}
                      className={inputCls(isDark)} />

                      <input
  type="file"
  accept="application/pdf,video/*"
  onChange={(e) => uploadCourseFile(e.target.files?.[0], "file_url")}
  className={`${inputCls(isDark)} mt-3`}
/>

{uploadingField === "file_url" && (
  <p className="text-[11px] font-bold text-[#E61A21] mt-2">
    Dosya yükleniyor...
  </p>
)}

                  </div>

                  {/* YouTube ID */}
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.25em] text-zinc-500 mb-2">YouTube Video ID / Video URL</p>
                    <input value={selected.cover_url || ""}
onChange={(e) => setSelected({ ...selected, cover_url: e.target.value })}
                      className={inputCls(isDark)} />

                      <div className="mt-3">
  <p className="text-[9px] font-black uppercase tracking-[0.25em] text-zinc-500 mb-2">
    Kapak Görseli Yükle
  </p>

  <input
    type="file"
    accept="image/*"
    onChange={(e) => uploadCourseFile(e.target.files?.[0], "thumbnail_url")}
    className={inputCls(isDark)}
  />

  {uploadingField === "thumbnail_url" && (
    <p className="text-[11px] font-bold text-[#E61A21] mt-2">
      Görsel yükleniyor...
    </p>
  )}
</div>

                  </div>

                  {/* LESSONS MANAGEMENT */}
<div>
  <p className="text-[9px] font-black uppercase tracking-[0.25em] text-zinc-500 mb-3">
    Dersler
  </p>

  <div className="space-y-3">
    {courseLessons.map((lesson, index) => (
      <div
        key={lesson.id || index}
        className={`rounded-2xl p-4 border ${
          isDark
            ? "border-white/10 bg-white/[0.03]"
            : "border-zinc-200 bg-zinc-50"
        }`}
      >
        <input
          type="text"
          value={lesson.title || ""}
          onChange={(e) => {
            const updated = [...courseLessons];
            updated[index].title = e.target.value;
            setCourseLessons(updated);
          }}
          placeholder="Ders Başlığı"
          className={inputCls(isDark)}
        />

        <input
  type="text"
  value={lesson.content_url || ""}
  onChange={(e) => {
    const updated = [...courseLessons];
    updated[index].content_url = e.target.value;
    setCourseLessons(updated);
  }}
  placeholder="İçerik URL"
  className={`${inputCls(isDark)} mt-3`}
/>

<input
  type="number"
  value={lesson.duration || ""}
  onChange={(e) => {
    const updated = [...courseLessons];
    updated[index].duration = e.target.value;
    setCourseLessons(updated);
  }}
  placeholder="Süre (dakika)"
  className={`${inputCls(isDark)} mt-3`}
/>


        <button
          type="button"
          onClick={() => {
            const updated = courseLessons.filter((_, i) => i !== index);
            setCourseLessons(updated);
          }}
          className="mt-3 px-4 py-2 rounded-xl bg-red-500/10 text-red-500 text-xs font-black uppercase"
        >
          Dersi Sil
        </button>
      </div>
    ))}

    <button
      type="button"
      onClick={() =>
        setCourseLessons([
          ...courseLessons,
          {
            title: "",
            content_url: "",
            content_type: "video",
          },
        ])
      }
      className="w-full rounded-2xl bg-[#E61A21] text-white py-3 text-sm font-black uppercase tracking-widest"
    >
      Yeni Ders Ekle
    </button>
  </div>
</div>

                  {/* Active toggle */}
                  <label className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer ${
                    isDark ? "bg-white/[0.03]" : "bg-zinc-50"
                  }`}>
                    <div className="relative shrink-0">
                      <input type="checkbox" checked={!!selected.is_active}
                        onChange={(e) => setSelected({ ...selected, is_active: e.target.checked })}
                        className="sr-only" />
                      <div
  className={`w-11 h-6 rounded-full transition-all duration-300 ${
    selected.is_active
      ? "bg-[#E61A21]"
      : isDark
      ? "bg-white/10"
      : "bg-zinc-200"
  }`}
/>
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-300 ${selected.is_active ? "left-6" : "left-1"}`} />
                    </div>
                    <span className={`text-sm font-black uppercase tracking-wide ${isDark ? "text-white" : "text-zinc-900"}`}>
                      Aktif olarak yayınla
                    </span>
                  </label>
                </div>

                <div className="flex gap-3 mt-6">
                  <button type="submit" disabled={saving}
                    className="flex-1 flex items-center justify-center gap-2 py-4 bg-[#E61A21] text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all hover:-translate-y-[2px] hover:shadow-lg hover:shadow-red-900/30 disabled:opacity-50">
                    {saving
                      ? <><IconLoader2 size={14} strokeWidth={2} className="animate-spin" /> Kaydediliyor...</>
                      : <><IconCheck size={14} strokeWidth={2.5} /> Kaydet</>
                    }
                  </button>
                  <button type="button" onClick={() => setSelected(null)}
                    className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${
                      isDark ? "bg-white/[0.06] text-zinc-300 hover:bg-white/[0.1]" : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                    }`}>
                    <IconX size={14} strokeWidth={2} />
                    Kapat
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>
      )}
    </EgitmenLayout>
  );
}