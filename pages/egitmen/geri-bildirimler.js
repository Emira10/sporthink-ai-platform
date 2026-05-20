import { useEffect, useMemo, useState } from "react";
import EgitmenLayout from "../../components/egitmen/EgitmenLayout";
import {
  IconMessageDots,
  IconStar,
  IconMail,
  IconClock,
  IconRefresh,
  IconSearch,
  IconFilter,
  IconAlertCircle,
  IconBulb,
  IconMoodSmile,
  IconUser,
  IconSend,
  IconLoader2,
  IconCheck,
  IconMessages,
} from "@tabler/icons-react";

// ── helpers ───────────────────────────────────────────────────────────
const inputCls = (isDark) =>
  `w-full rounded-xl px-4 py-3 border outline-none text-sm font-semibold transition-all duration-200
  ${isDark
    ? "bg-white/[0.03] border-white/10 text-white placeholder:text-zinc-600 focus:border-[#E61A21]/50 focus:bg-white/[0.06]"
    : "bg-zinc-50 border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus:border-[#E61A21]/50 focus:bg-white"}`;

const selectCls = (isDark) =>
  `rounded-xl px-4 py-3 border outline-none text-sm font-semibold transition-all duration-200
  ${isDark
    ? "bg-white/[0.03] border-white/10 text-white focus:border-[#E61A21]/50"
    : "bg-white border-zinc-200 text-zinc-900 shadow-sm focus:border-[#E61A21]/50"}`;

const textareaCls = (isDark) =>
  `w-full min-h-[100px] rounded-xl px-4 py-3 border outline-none text-sm font-semibold resize-none transition-all duration-200
  ${isDark
    ? "bg-white/[0.03] border-white/10 text-white placeholder:text-zinc-600 focus:border-[#22C55E]/50"
    : "bg-zinc-50 border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus:border-[#22C55E]/50"}`;

// ── type config ──────────────────────────────────────────────────────
const TYPE_CONFIG = {
  general:        { label: "Genel Mesaj",             icon: IconMessageDots, accent: "#3B82F6"  },
  course_rating:  { label: "Kurs Değerlendirmesi",    icon: IconStar,        accent: "#F59E0B"  },
  trainer_rating: { label: "Eğitmen Değerlendirmesi", icon: IconUser,        accent: "#8B5CF6"  },
  suggestion:     { label: "Öneri",                   icon: IconBulb,        accent: "#22C55E"  },
  report:         { label: "Sorun Bildirimi",         icon: IconAlertCircle, accent: "#E61A21"  },
  daily_mood:     { label: "Günlük Değerlendirme",    icon: IconMoodSmile,   accent: "#F59E0B"  },
};

function getConfig(type) {
  return TYPE_CONFIG[type] || { label: "Geri Bildirim", icon: IconMessageDots, accent: "#E61A21" };
}

// ── stat card ─────────────────────────────────────────────────────────
function KpiCard({ isDark, accent, icon: Icon, label, value, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{ borderLeft: `3px solid ${accent}` }}
      className={`cursor-pointer hover:scale-[1.02] rounded-[1.25rem] px-5 py-4 transition-all ${
        isDark
          ? "bg-white/[0.02] shadow-[0_0_0_1px_rgba(255,255,255,0.06)]"
          : "bg-white shadow-[0_2px_12px_rgba(0,0,0,0.07)]"
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon size={13} strokeWidth={2} style={{ color: accent }} aria-hidden="true" />
        <p className="text-[9px] font-black uppercase tracking-[0.25em] text-zinc-500">{label}</p>
      </div>
      <p style={{ color: accent }} className="text-3xl font-black tabular-nums">{value}</p>
    </div>
  );
}

// ── star rating ───────────────────────────────────────────────────────
function StarRating({ rating }) {
  if (!rating) return null;
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <IconStar key={i} size={13} strokeWidth={1.5}
          style={{ color: i <= rating ? "#F59E0B" : undefined, fill: i <= rating ? "#F59E0B" : "none" }}
          className={i <= rating ? "" : "text-zinc-300"}
          aria-hidden="true" />
      ))}
      <span className="text-[10px] font-black text-zinc-500 ml-1">{rating}/5</span>
    </div>
  );
}

// ── time helper ───────────────────────────────────────────────────────
function timeAgo(dateStr) {
  if (!dateStr) return "—";
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 60000);
  if (diff < 1)    return "az önce";
  if (diff < 60)   return `${diff} dk önce`;
  if (diff < 1440) return `${Math.floor(diff / 60)} sa önce`;
  return new Date(dateStr).toLocaleString("tr-TR");
}

// ── main ──────────────────────────────────────────────────────────────
export default function FeedbackList() {
  // ── state — كودك الأصلي ──
  const [list,         setList]         = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [typeFilter,   setTypeFilter]   = useState("all");
  const [search,       setSearch]       = useState("");
  const [replyText,    setReplyText]    = useState({});
  const [replyLoading, setReplyLoading] = useState(false);
  const [selectedStat, setSelectedStat] = useState(null);
  const [trainerNotifications, setTrainerNotifications] = useState([]);

  useEffect(() => {
  loadInitialData();
}, []);

  // ── loadInitialData — أصلي ──
  async function loadInitialData() {
  setLoading(true);

  try {
    const res = await fetch("/api/egitmen/feedbacks");
    const json = await res.json();

    if (!res.ok || !json.ok) {
      console.error("Feedback API hatası:", json.message);
      setList([]);
      return;
    }

    setList(json.rows || []);

    const trainersRes = await fetch("/api/yonetici/kullanicilar");
const trainersJson = await trainersRes.json();

if (trainersJson.ok) {
  const trainers = (trainersJson.users || [])
    .filter((u) => Number(u.tur_id) === 2)
    .sort(
      (a, b) =>
        new Date(b.kayit_tarihi || b.created_at || 0) -
        new Date(a.kayit_tarihi || a.created_at || 0)
    )
    .slice(0, 5);

  setTrainerNotifications(trainers);
}

  } catch (err) {
    console.error("Feedback fetch hatası:", err);
    setList([]);
  } finally {
    setLoading(false);
  }
}

  // ── filteredList — أصلي ──
  const filteredList = useMemo(() => {
    return list.filter((f) => {
      const matchesType = typeFilter === "all" || f.feedback_type === typeFilter;
      const text = `${f.user_email || ""} ${f.message || ""} ${f.feedback_type || ""}`.toLowerCase();
      return matchesType && text.includes(search.toLowerCase());
    });
  }, [list, typeFilter, search]);

  // ── stats — أصلي ──
  const stats = useMemo(() => ({
    total:   list.length,
    course:  list.filter((f) => f.feedback_type === "course_rating").length,
    trainer: list.filter((f) => f.feedback_type === "trainer_rating").length,
    reports: list.filter((f) => f.feedback_type === "report").length,
  }), [list]);

  // ── submitReply — أصلي ──
  async function submitReply(feedbackId) {
    const text = replyText[feedbackId];
    if (!text?.trim()) return;
    setReplyLoading(true);
    try {
      const res = await fetch("/api/egitmen/reply-feedback", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedback_id: feedbackId, trainer_reply: text }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      setList((prev) => prev.map((item) =>
        item.id === feedbackId ? { ...item, trainer_reply: text, status: "answered" } : item
      ));
      setReplyText((prev) => ({ ...prev, [feedbackId]: "" }));
    } catch (err) {
      console.error(err);
      alert("Yanıt gönderilemedi");
    } finally {
      setReplyLoading(false);
    }
  }

  async function deleteFeedback(feedbackId) {
  const confirmed = window.confirm("Bu geri bildirimi silmek istediğine emin misin?");
  if (!confirmed) return;

  try {
    const res = await fetch("/api/egitmen/delete-feedback", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ feedback_id: feedbackId }),
    });

    const result = await res.json();

    if (!res.ok || !result.success) {
      throw new Error(result.error || "Silme işlemi başarısız");
    }

    setList((prev) => prev.filter((item) => item.id !== feedbackId));
  } catch (err) {
    console.error(err);
    alert("Geri bildirim silinemedi");
  }
}

  return (
    <EgitmenLayout pageTitle="Geri Bildirimler">
      {({ isDark }) => (
        <div className="space-y-6">

          {/* ══════════════════════════════════════
              ① STATS BAR
          ══════════════════════════════════════ */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KpiCard
  isDark={isDark}
  accent="#E61A21"
  icon={IconMessages}
  label="Toplam"
  value={stats.total}
  onClick={() => setSelectedStat("all")}
/>

<KpiCard
  isDark={isDark}
  accent="#F59E0B"
  icon={IconStar}
  label="Kurs"
  value={stats.course}
  onClick={() => setSelectedStat("course_rating")}
/>

<KpiCard
  isDark={isDark}
  accent="#3B82F6"
  icon={IconUser}
  label="Eğitmen"
  value={stats.trainer}
  onClick={() => setSelectedStat("trainer_rating")}
/>

<KpiCard
  isDark={isDark}
  accent="#E61A21"
  icon={IconAlertCircle}
  label="Bildirim"
  value={stats.reports}
  onClick={() => setSelectedStat("report")}
/>
          </div>

          {/* ══════════════════════════════════════
              ② SEARCH + FILTER BAR
          ══════════════════════════════════════ */}
          <div
            className={`rounded-[1.5rem] p-4 flex flex-col md:flex-row gap-3 md:items-center ${
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
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Öğrenci, mesaj veya kurs ara..."
                className={`${inputCls(isDark)} pl-10`}
              />
            </div>

            {/* Type filter */}
            <div className="relative shrink-0">
              <IconFilter size={14} strokeWidth={2}
                className={`absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none ${isDark ? "text-zinc-500" : "text-zinc-400"}`}
                aria-hidden="true" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className={`${selectCls(isDark)} pl-9`}
              >
                <option value="all">Tüm Geri Bildirimler</option>
                <option value="general">Genel Mesaj</option>
                <option value="course_rating">Kurs Değerlendirmesi</option>
                <option value="trainer_rating">Eğitmen Değerlendirmesi</option>
                <option value="suggestion">Öneri</option>
                <option value="report">Sorun Bildirimi</option>
                <option value="daily_mood">Günlük Değerlendirme</option>
              </select>
            </div>

            {/* Refresh */}
            <button
              onClick={loadInitialData}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#E61A21] text-white font-black text-[11px] uppercase tracking-widest transition-all duration-200 hover:-translate-y-[2px] hover:shadow-lg hover:shadow-red-900/30 shrink-0"
            >
              <IconRefresh size={15} strokeWidth={2}
                className={loading ? "animate-spin" : ""} aria-hidden="true" />
              Yenile
            </button>
          </div>

          {selectedStat && (
  <div className={`rounded-[1.5rem] p-5 border ${
    isDark
      ? "bg-white/[0.03] border-white/10"
      : "bg-white border-zinc-200 shadow-lg"
  }`}>
    <div className="flex items-center justify-between mb-4">
      <h3 className={`text-sm font-black uppercase ${
        isDark ? "text-white" : "text-zinc-900"
      }`}>
        {selectedStat === "all" && "Tüm Geri Bildirimler"}
        {selectedStat === "course_rating" && "Kurs Değerlendirmeleri"}
        {selectedStat === "trainer_rating" && "Eğitmen Değerlendirmeleri"}
        {selectedStat === "report" && "Sorun Bildirimleri"}
      </h3>

      <button
        onClick={() => setSelectedStat(null)}
        className="px-4 py-2 rounded-xl bg-[#E61A21] text-white text-xs font-black"
      >
        Kapat
      </button>
    </div>

    <div className="space-y-3">
      {filteredList
        .filter((f) => {
          if (selectedStat === "all") return true;
          return f.feedback_type === selectedStat;
        })
        .map((f) => {
          const cfg = getConfig(f.feedback_type);

          return (
            <div
              key={`stat-${f.id}`}
              className={`rounded-xl p-4 ${
                isDark ? "bg-white/[0.04]" : "bg-zinc-50"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <p className={`text-sm font-black ${
                  isDark ? "text-white" : "text-zinc-900"
                }`}>
                  {f.user_name || f.user_email || "Kullanıcı"}
                </p>

                <span
                  style={{ color: cfg.accent }}
                  className="text-[10px] font-black uppercase"
                >
                  {cfg.label}
                </span>
              </div>

              <p className={`text-sm ${
                isDark ? "text-zinc-300" : "text-zinc-700"
              }`}>
                {f.message}
              </p>
            </div>
          );
        })}
    </div>
  </div>
)}

          {/* ══════════════════════════════════════
              ③ FEEDBACK LIST
          ══════════════════════════════════════ */}
          {loading ? (
            <div className="flex items-center justify-center gap-3 py-20">
              <IconLoader2 size={22} strokeWidth={1.75} className="animate-spin text-[#E61A21]" aria-hidden="true" />
              <span className={`text-sm font-bold ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>
                Geri bildirimler yükleniyor...
              </span>
            </div>
          ) : filteredList.length === 0 ? (
            <div className={`rounded-[1.5rem] p-12 text-center ${
              isDark
                ? "bg-white/[0.02] shadow-[0_0_0_1px_rgba(255,255,255,0.06)]"
                : "bg-white shadow-[0_2px_16px_rgba(0,0,0,0.07)]"
            }`}>
              <IconMessageDots size={40} strokeWidth={1} className="mx-auto mb-3 text-zinc-300" aria-hidden="true" />
              <p className={`text-sm font-bold ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>
                Henüz geri bildirim yok...
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredList.map((f) => {
                const cfg  = getConfig(f.feedback_type);
                const Icon = cfg.icon;

                return (
                  <div
                    key={f.id}
                    style={{ borderLeft: `3px solid ${cfg.accent}` }}
                    className={`rounded-r-[1.5rem] rounded-l-sm p-6 transition-all duration-200 ${
                      isDark
                        ? "bg-white/[0.02] shadow-[0_0_0_1px_rgba(255,255,255,0.06)] hover:bg-white/[0.04]"
                        : "bg-white shadow-[0_2px_16px_rgba(0,0,0,0.07)] hover:shadow-[0_4px_24px_rgba(0,0,0,0.1)]"
                    }`}
                  >
                    {/* ── Card header ── */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
                      <div className="flex items-center gap-3">
                        {/* Type icon box */}
                        <div
                          style={{ backgroundColor: `${cfg.accent}15`, color: cfg.accent }}
                          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        >
                          <Icon size={18} strokeWidth={1.75} aria-hidden="true" />
                        </div>

                        <div>
                          <p style={{ color: cfg.accent }}
                            className="text-[10px] font-black uppercase tracking-[0.25em]">
                            {cfg.label}
                          </p>
                          <p className={`text-[11px] font-semibold flex items-center gap-1.5 mt-0.5 ${
                            isDark ? "text-zinc-500" : "text-zinc-400"
                          }`}>
                            <IconMail size={11} strokeWidth={2} aria-hidden="true" />
                            {f.user_email || "Bilinmeyen kullanıcı"}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col items-start md:items-end gap-2">
                        <StarRating rating={f.rating} />

                        <button
  type="button"
  onClick={() => deleteFeedback(f.id)}
  className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all"
>
  Sil
</button>

                        <div className="flex items-center gap-3">
                          {/* Status badge */}
                          {f.status && (
                            <span
                              style={{
                                backgroundColor: f.status === "answered" ? "#22C55E15" : `${cfg.accent}12`,
                                color: f.status === "answered" ? "#22C55E" : cfg.accent,
                              }}
                              className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg"
                            >
                              {f.status === "answered" ? "Yanıtlandı" : f.status}
                            </span>
                          )}

                          {/* Time */}
                          <span className={`text-[10px] font-bold flex items-center gap-1 ${
                            isDark ? "text-zinc-600" : "text-zinc-400"
                          }`}>
                            <IconClock size={11} strokeWidth={2} aria-hidden="true" />
                            {timeAgo(f.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* ── Message bubble ── */}
                    <div
                      className={`rounded-xl px-5 py-4 mb-5 ${
                        isDark ? "bg-white/[0.03]" : "bg-zinc-50"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <IconMessageDots size={14} strokeWidth={2}
                          style={{ color: cfg.accent }}
                          className="mt-0.5 shrink-0" aria-hidden="true" />
                        <p className={`text-sm font-semibold leading-relaxed ${
                          isDark ? "text-zinc-300" : "text-zinc-700"
                        }`}>
                          {f.message}
                        </p>
                      </div>
                    </div>

                    {/* ── Reply section ── */}
                    <div className={`pt-5 border-t ${isDark ? "border-white/[0.06]" : "border-zinc-100"}`}>
                      {f.trainer_reply ? (
                        /* Replied state */
                        <div
                          style={{ borderLeft: "3px solid #22C55E" }}
                          className={`rounded-r-xl rounded-l-sm px-4 py-4 ${
                            isDark ? "bg-green-500/[0.08]" : "bg-green-50"
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <IconCheck size={13} strokeWidth={2.5} className="text-green-500" aria-hidden="true" />
                            <p className="text-[9px] font-black uppercase tracking-[0.25em] text-green-500">
                              Eğitmen Yanıtı
                            </p>
                          </div>
                          <p className={`text-sm font-semibold leading-relaxed ${
                            isDark ? "text-zinc-200" : "text-zinc-700"
                          }`}>
                            {f.trainer_reply}
                          </p>
                        </div>
                      ) : (
                        /* Reply form */
                        <div className="space-y-3">
                          <p className="text-[9px] font-black uppercase tracking-[0.25em] text-zinc-500 mb-2">
                            Öğrenciye Yanıt Yaz
                          </p>
                          <textarea
                            value={replyText[f.id] || ""}
                            onChange={(e) => setReplyText((prev) => ({ ...prev, [f.id]: e.target.value }))}
                            placeholder="Yanıtını buraya yaz..."
                            className={textareaCls(isDark)}
                          />
                          <button
                            onClick={() => submitReply(f.id)}
                            disabled={replyLoading}
                            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-green-500 text-white font-black text-[11px] uppercase tracking-widest transition-all duration-200 hover:-translate-y-[2px] hover:shadow-lg hover:shadow-green-900/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                          >
                            {replyLoading
                              ? <IconLoader2 size={14} strokeWidth={2} className="animate-spin" aria-hidden="true" />
                              : <IconSend size={14} strokeWidth={2} aria-hidden="true" />
                            }
                            {replyLoading ? "Gönderiliyor..." : "Yanıt Gönder"}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {trainerNotifications.length > 0 && (
  <div
    className={`rounded-[1.5rem] p-5 border ${
      isDark
        ? "bg-white/[0.03] border-white/10"
        : "bg-white border-zinc-200 shadow-lg"
    }`}
  >
    <div className="flex items-center justify-between mb-4">
      <h3
        className={`text-sm font-black uppercase tracking-widest ${
          isDark ? "text-white" : "text-zinc-900"
        }`}
      >
        Yeni Eğitmen Bildirimleri
      </h3>

      <span className="text-[10px] font-black text-[#E61A21] uppercase tracking-widest">
        Canlı
      </span>
    </div>

    <div className="space-y-3">
      {trainerNotifications.map((u) => (
        <div
          key={u.kullanici_id}
          className={`rounded-xl p-4 flex items-center justify-between ${
            isDark ? "bg-white/[0.04]" : "bg-zinc-50"
          }`}
        >
          <div>
            <p
              className={`text-sm font-black ${
                isDark ? "text-white" : "text-zinc-900"
              }`}
            >
              {u.ad} {u.soyad}
            </p>

            <p className="text-xs text-zinc-500 mt-1">
              Yeni eğitmen sisteme eklendi.
            </p>

            <button
  onClick={() =>
    setTrainerNotifications((prev) =>
      prev.filter((x) => x.kullanici_id !== u.kullanici_id)
    )
  }
  className="mt-3 text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-700 transition-all"
>
  Bildirimi Sil
</button>

          </div>

          <span className="text-[10px] font-black text-[#E61A21] uppercase">
            Eğitmen
          </span>
        </div>
      ))}
    </div>
  </div>
)}

        </div>
      )}
    </EgitmenLayout>
  );
}